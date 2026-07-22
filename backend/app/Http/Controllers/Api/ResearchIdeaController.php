<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchActivityLog;
use App\Models\User;
use App\Enums\IdeaStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResearchIdeaController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = ResearchIdea::with(['submitter', 'attachments', 'assignedToDirector']);

        // Check if user has management capabilities
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        
        // Filter based on user access:
        // 1. Users with management access see ALL ideas (they can assign to others)
        // 2. Users without management access see ONLY ideas assigned to them
        if (!$hasManagementAccess) {
            $query->where('assigned_to_director', $user->id);
        }
        // If user has management access, no filtering needed - they see all

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->category) {
            $query->where('research_category', $request->category);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('summary', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'problem_statement' => 'required|string',
            'objectives' => 'required|string',
            'expected_outcome' => 'required|string',
            'research_category' => 'required|string',
            'government_sector' => 'nullable|string',
            'priority' => 'nullable|string',
            'sub_city_id' => 'nullable|exists:sub_cities,id',
        ]);

        $validated['submitted_by'] = auth()->id();
        $validated['status'] = IdeaStatus::DRAFT;
        $validated['assignment_status'] = 'pending_smart_city';

        // Auto-assign to Smart City Command Center
        $smartCityUser = User::whereHas('roles', function($q) {
            $q->where('name', 'smart_city_command');
        })->first();
        
        if ($smartCityUser) {
            $validated['assigned_to_smart_city'] = $smartCityUser->id;
        }

        $idea = ResearchIdea::create($validated);

        ResearchActivityLog::log('created', $idea, null, $validated, 'Research idea created and assigned to Smart City Command Center');

        return response()->json($idea->load('submitter', 'assignedToSmartCity'), 201);
    }

    public function show(ResearchIdea $researchIdea)
    {
        $user = auth()->user();
        
        // Check if user has management capabilities
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        
        // If user doesn't have management access, they can only view ideas assigned to them
        if (!$hasManagementAccess && $researchIdea->assigned_to_director != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Research idea not found or access denied',
            ], 404);
        }
        
        return response()->json([
            'data' => $researchIdea->load([
                'submitter',
                'attachments',
                'screenings.evaluator',
                'project',
                'assignedToDirector'
            ])
        ]);
    }

    public function update(Request $request, ResearchIdea $researchIdea)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'summary' => 'sometimes|string',
            'problem_statement' => 'sometimes|string',
            'objectives' => 'sometimes|string',
            'expected_outcome' => 'sometimes|string',
            'research_category' => 'sometimes|string',
            'government_sector' => 'nullable|string',
            'priority' => 'nullable|string',
        ]);

        $oldValues = $researchIdea->toArray();
        $researchIdea->update($validated);

        ResearchActivityLog::log('updated', $researchIdea, $oldValues, $validated, 'Research idea updated');

        return response()->json($researchIdea->load('submitter'));
    }

    public function destroy(ResearchIdea $researchIdea)
    {
        ResearchActivityLog::log('deleted', $researchIdea, $researchIdea->toArray(), null, 'Research idea deleted');
        
        $researchIdea->delete();

        return response()->json(['message' => 'Research idea deleted successfully']);
    }

    public function submit(ResearchIdea $researchIdea)
    {
        $researchIdea->update([
            'status' => IdeaStatus::SUBMITTED,
            'submitted_at' => now(),
            'smart_city_assigned_at' => now(),
            'assignment_status' => 'pending_smart_city',
        ]);

        // Auto-assign to Smart City Command Center if not already assigned
        if (!$researchIdea->assigned_to_smart_city) {
            $smartCityUser = User::whereHas('roles', function($q) {
                $q->where('name', 'smart_city_command');
            })->first();
            
            if ($smartCityUser) {
                $researchIdea->update(['assigned_to_smart_city' => $smartCityUser->id]);
            }
        }

        ResearchActivityLog::log('submitted', $researchIdea, null, null, 'Research idea submitted to Smart City Command Center for review');

        return response()->json($researchIdea->load('assignedToSmartCity'));
    }

    /**
     * Get assignable users based on hierarchy
     */
    public function getAssignableUsers(Request $request)
    {
        $user = $request->user();
        $assignableUsers = \App\Services\RoleHierarchyService::getManageableUsers($user);
        
        return response()->json([
            'success' => true,
            'data' => $assignableUsers
        ]);
    }

    /**
     * Assign research idea to a user for review/handling
     */
    public function assign(Request $request, ResearchIdea $researchIdea)
    {
        $validator = validator($request->all(), [
            'assigned_to' => 'required|integer|exists:users,id',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $researchIdea->update([
            'assigned_to_director' => $request->assigned_to,
            'director_assigned_at' => now(),
            'director_notes' => $request->notes 
                ? ($researchIdea->director_notes ? $researchIdea->director_notes . "\n" . $request->notes : $request->notes)
                : $researchIdea->director_notes,
            'assignment_status' => 'assigned_to_director',
        ]);

        ResearchActivityLog::log(
            'assigned', 
            $researchIdea, 
            null, 
            ['assigned_to' => $request->assigned_to], 
            'Research idea assigned to user'
        );

        return response()->json([
            'success' => true,
            'message' => 'Research idea assigned successfully',
            'data' => $researchIdea->fresh()->load(['submitter', 'assignedToDirector']),
        ]);
    }

    /**
     * Update research idea status
     */
    public function updateStatus(Request $request, ResearchIdea $researchIdea)
    {
        $validator = validator($request->all(), [
            'status' => 'required|string',
            'notes' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Check if user has permission to update status:
        // 1. Users with management access can update any idea
        // 2. Users assigned to the idea can update it
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        $isAssignedToIdea = $researchIdea->assigned_to_director == $user->id;
        
        if (!$hasManagementAccess && !$isAssignedToIdea) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this research idea status',
            ], 403);
        }

        $oldStatus = $researchIdea->status;
        $researchIdea->update([
            'status' => $request->status,
            'director_notes' => $request->notes
                ? ($researchIdea->director_notes ? $researchIdea->director_notes . "\n" . $request->notes : $request->notes)
                : $researchIdea->director_notes,
        ]);

        ResearchActivityLog::log(
            'status_updated', 
            $researchIdea, 
            ['status' => $oldStatus], 
            ['status' => $request->status], 
            "Status changed from {$oldStatus} to {$request->status}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Research idea status updated successfully',
            'data' => $researchIdea->fresh()->load(['submitter', 'assignedToDirector']),
        ]);
    }

    public function uploadAttachment(Request $request, ResearchIdea $researchIdea)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('research-ideas/' . $researchIdea->id, 'public');

        $attachment = $researchIdea->attachments()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json($attachment, 201);
    }

    public function deleteAttachment(ResearchIdea $researchIdea, $attachmentId)
    {
        $attachment = $researchIdea->attachments()->findOrFail($attachmentId);
        
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully']);
    }

    /**
     * Download an attachment from a research idea
     */
    public function downloadAttachment(Request $request, ResearchIdea $researchIdea, $attachmentId)
    {
        $user = $request->user();
        
        // Check access permissions
        $canAccess = false;

        // Submitter can download their own files
        if ($researchIdea->submitted_by && $researchIdea->submitted_by === $user->id) {
            $canAccess = true;
        }

        // Assigned user can download
        if ($researchIdea->assigned_to_director && $researchIdea->assigned_to_director === $user->id) {
            $canAccess = true;
        }

        // Managers can download based on hierarchy
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        if ($hasManagementAccess) {
            $canAccess = true;
        }

        if (!$canAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this file',
            ], 403);
        }

        $attachment = $researchIdea->attachments()->findOrFail($attachmentId);

        // Verify file exists in storage
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->file(
            storage_path('app/public/' . $attachment->file_path),
            [
                'Content-Type' => $attachment->file_type,
                'Content-Disposition' => 'inline; filename="' . $attachment->file_name . '"'
            ]
        );
    }
}
