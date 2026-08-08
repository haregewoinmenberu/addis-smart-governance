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
        // 2. Users without management access see:
        //    - Ideas assigned to them as director
        //    - Ideas where they have assignments (team leader or officer)
        //    - Ideas they created themselves
        if (!$hasManagementAccess) {
            $query->where(function($q) use ($user) {
                $q->where('assigned_to_director', $user->id)
                  ->orWhere('submitted_by', $user->id)
                  ->orWhereHas('assignments', function($assignQuery) use ($user) {
                      $assignQuery->where('assigned_to', $user->id)
                                  ->whereIn('status', ['pending', 'accepted', 'in_progress']);
                  });
            });
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

        if ($request->assigned_to_director) {
            $query->where('assigned_to_director', $request->assigned_to_director);
        }

        if ($request->submitted_by) {
            $query->where('submitted_by', $request->submitted_by);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('summary', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 20); // Default to 20, but allow override
        $perPage = min(max((int)$perPage, 1), 100); // Clamp between 1 and 100

        return response()->json($query->latest()->paginate($perPage));
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
        
        // Check if user has management capabilities (directors and above see all)
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        
        if (!$hasManagementAccess) {
            // Check if user is the director assignee
            $isDirectorAssignee = $researchIdea->assigned_to_director == $user->id;
            
            // Check if user submitted it
            $isSubmitter = $researchIdea->submitted_by == $user->id;
            
            // Check if user has a team leader or officer assignment on this research
            $isAssigned = \App\Models\ResearchAssignment::where('research_idea_id', $researchIdea->id)
                ->where('assigned_to', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'in_progress'])
                ->exists();

            if (!$isDirectorAssignee && !$isSubmitter && !$isAssigned) {
                return response()->json([
                    'success' => false,
                    'message' => 'Research idea not found or access denied',
                ], 404);
            }
        }
        
        return response()->json([
            'data' => $researchIdea->load([
                'submitter',
                'attachments.uploader',
                'attachments.lastEditor',
                'attachments.versions.uploader',
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

        // Convert enum to string for logging
        $oldStatusValue = $oldStatus instanceof \BackedEnum ? $oldStatus->value : (string) $oldStatus;
        $newStatusValue = $request->status;

        ResearchActivityLog::log(
            'status_updated', 
            $researchIdea, 
            ['status' => $oldStatusValue], 
            ['status' => $newStatusValue], 
            "Status changed from {$oldStatusValue} to {$newStatusValue}"
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

        return response()->json($attachment->load(['uploader', 'lastEditor']), 201);
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

        // Assigned director can download
        if ($researchIdea->assigned_to_director && $researchIdea->assigned_to_director === $user->id) {
            $canAccess = true;
        }

        // Managers can download based on hierarchy
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        if ($hasManagementAccess) {
            $canAccess = true;
        }

        // Team leaders/officers actually assigned to this research can access
        // its documents too — including files they themselves uploaded while
        // working a stage, which otherwise nobody without hierarchy management
        // capability (e.g. a research_officer) could ever download.
        $isAssignedToResearch = $researchIdea->assignments()
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->exists();
        if ($isAssignedToResearch) {
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

    /**
     * Check if user can edit a specific attachment based on role hierarchy
     */
    public function checkAttachmentEditPrivilege(Request $request, ResearchIdea $researchIdea, $attachmentId)
    {
        $user = $request->user();
        $attachment = $researchIdea->attachments()->findOrFail($attachmentId);

        $canEdit = false;
        $reason = '';

        // Get uploader role level
        $uploader = $attachment->uploader;
        if (!$uploader) {
            return response()->json([
                'success' => true,
                'can_edit' => false,
                'reason' => 'Original uploader information not available',
                'attachment' => $attachment->load(['uploader', 'lastEditor']),
            ]);
        }

        $uploaderRoles = $uploader->roles->pluck('name')->toArray();
        $viewerRoles = $user->roles->pluck('name')->toArray();

        // Get the highest role level for both users (lower number = higher authority)
        $uploaderLevel = min(array_map(
            fn($role) => \App\Services\RoleHierarchyService::getRoleLevel($role),
            $uploaderRoles
        ));
        $viewerLevel = min(array_map(
            fn($role) => \App\Services\RoleHierarchyService::getRoleLevel($role),
            $viewerRoles
        ));

        // User can edit if they have same or higher authority (same or lower level number)
        if ($viewerLevel <= $uploaderLevel) {
            $canEdit = true;
            $reason = $viewerLevel < $uploaderLevel 
                ? 'You have higher authority than the uploader'
                : 'You have the same authority level as the uploader';
        } else {
            $reason = 'You have lower authority than the original uploader';
        }

        // Also allow edit if the user is the uploader themselves
        if ($attachment->uploaded_by === $user->id) {
            $canEdit = true;
            $reason = 'You are the original uploader';
        }

        return response()->json([
            'success' => true,
            'can_edit' => $canEdit,
            'reason' => $reason,
            'uploader_level' => $uploaderLevel,
            'viewer_level' => $viewerLevel,
            'attachment' => $attachment->load(['uploader', 'lastEditor']),
        ]);
    }

    /**
     * Update/replace an existing attachment by creating a new version
     */
    public function updateAttachment(Request $request, ResearchIdea $researchIdea, $attachmentId)
    {
        $user = $request->user();
        $attachment = $researchIdea->attachments()->findOrFail($attachmentId);

        // Check edit privilege using the same logic
        $uploader = $attachment->uploader;
        if (!$uploader) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit attachment - uploader information not available',
            ], 403);
        }

        $uploaderRoles = $uploader->roles->pluck('name')->toArray();
        $viewerRoles = $user->roles->pluck('name')->toArray();

        $uploaderLevel = min(array_map(
            fn($role) => \App\Services\RoleHierarchyService::getRoleLevel($role),
            $uploaderRoles
        ));
        $viewerLevel = min(array_map(
            fn($role) => \App\Services\RoleHierarchyService::getRoleLevel($role),
            $viewerRoles
        ));

        $canEdit = ($viewerLevel <= $uploaderLevel) || ($attachment->uploaded_by === $user->id);

        if (!$canEdit) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this attachment. You need the same or higher authority as the uploader.',
            ], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240',
            'version_notes' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        
        // Store new file
        $path = $file->store('research-ideas/' . $researchIdea->id, 'public');

        // Get next version number
        $latestVersion = \App\Models\ResearchAttachmentVersion::where('attachment_id', $attachment->id)
            ->max('version_number');
        $newVersionNumber = ($latestVersion ?? 0) + 1;

        // Mark all previous versions as not current
        \App\Models\ResearchAttachmentVersion::where('attachment_id', $attachment->id)
            ->update(['is_current' => false]);

        // Create new version
        $version = \App\Models\ResearchAttachmentVersion::create([
            'attachment_id' => $attachment->id,
            'version_number' => $newVersionNumber,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $user->id,
            'version_notes' => $request->input('version_notes'),
            'is_current' => true,
        ]);

        // Update attachment metadata to point to current version
        $attachment->update([
            'edited_by' => $user->id,
            'edited_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'New version created successfully',
            'data' => [
                'attachment' => $attachment->fresh()->load(['uploader', 'lastEditor', 'versions.uploader']),
                'new_version' => $version->load('uploader'),
            ],
        ]);
    }
}
