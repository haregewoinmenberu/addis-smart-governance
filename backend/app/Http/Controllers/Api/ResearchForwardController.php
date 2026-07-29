<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchForwardRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResearchForwardController extends Controller
{
    /**
     * Get forward requests
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ResearchForwardRequest::with([
            'researchIdea',
            'forwardedBy',
            'forwardedTo',
            'acknowledgedBy'
        ]);

        // Filter based on user role
        if ($user->hasRole('research_director')) {
            // Director sees forwards they created
            $query->where('forwarded_by', $user->id);
        } elseif ($user->hasRole('smart_city_command') || $user->hasRole('smart_city_sector_head')) {
            // Smart City sees forwards to them
            $query->where(function ($q) use ($user) {
                $q->where('forwarded_to', $user->id)
                  ->orWhereNull('forwarded_to'); // General forwards
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * Forward research to Smart City
     */
    public function forwardToSmartCity(Request $request, ResearchIdea $researchIdea)
    {
        $user = $request->user();

        // Check permission
        if (!$user->hasPermission('forward_to_smart_city')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to forward research',
            ], 403);
        }

        // Verify research is approved
        if ($researchIdea->status->value !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Only approved research can be forwarded',
            ], 422);
        }

        // Check if workflow is completed
        $progressPercentage = $researchIdea->getProgressPercentage();
        if ($progressPercentage < 100) {
            return response()->json([
                'success' => false,
                'message' => 'Research workflow must be completed before forwarding',
            ], 422);
        }

        $validated = $request->validate([
            'forward_to_user_id' => 'nullable|exists:users,id',
            'forward_message' => 'required|string|min:20',
            'recommendations' => 'required|array',
            'recommendations.*.title' => 'required|string',
            'recommendations.*.description' => 'required|string',
            'recommendations.*.priority' => 'required|in:low,medium,high,critical',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max
        ]);

        // Handle file uploads
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('research-forwards/' . $researchIdea->id, 'public');
                $attachmentPaths[] = [
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        // Get Smart City user if not specified
        $forwardToUser = $validated['forward_to_user_id'] ?? null;
        if (!$forwardToUser) {
            $smartCityUser = User::whereHas('roles', function ($q) {
                $q->where('name', 'smart_city_command');
            })->first();
            $forwardToUser = $smartCityUser?->id;
        }

        $forwardRequest = ResearchForwardRequest::create([
            'research_idea_id' => $researchIdea->id,
            'forwarded_by' => $user->id,
            'forwarded_to' => $forwardToUser,
            'forward_message' => $validated['forward_message'],
            'recommendations' => $validated['recommendations'],
            'attachments' => $attachmentPaths,
            'forwarded_at' => now(),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Research forwarded to Smart City successfully',
            'data' => $forwardRequest->load(['researchIdea', 'forwardedBy', 'forwardedTo']),
        ]);
    }

    /**
     * Show forward request details
     */
    public function show(ResearchForwardRequest $forwardRequest)
    {
        return response()->json([
            'success' => true,
            'data' => $forwardRequest->load([
                'researchIdea.workflowProgress.stage',
                'forwardedBy',
                'forwardedTo',
                'acknowledgedBy'
            ]),
        ]);
    }

    /**
     * Acknowledge receipt of forwarded research (Smart City)
     */
    public function acknowledge(Request $request, ResearchForwardRequest $forwardRequest)
    {
        $user = $request->user();

        // Check if user is Smart City
        if (!$user->hasAnyRole(['smart_city_command', 'smart_city_sector_head'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Smart City users can acknowledge forwards',
            ], 403);
        }

        $validated = $request->validate([
            'feedback' => 'nullable|string',
        ]);

        $forwardRequest->acknowledge($user, $validated['feedback'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Forward request acknowledged successfully',
            'data' => $forwardRequest->fresh(),
        ]);
    }

    /**
     * Update status of forward request (Smart City)
     */
    public function updateStatus(Request $request, ResearchForwardRequest $forwardRequest)
    {
        $user = $request->user();

        // Check if user is Smart City
        if (!$user->hasAnyRole(['smart_city_command', 'smart_city_sector_head'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Smart City users can update forward status',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:acknowledged,under_review,accepted,implemented',
            'feedback' => 'nullable|string',
        ]);

        $forwardRequest->update([
            'status' => $validated['status'],
            'smart_city_feedback' => $validated['feedback'] ?? $forwardRequest->smart_city_feedback,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Forward request status updated successfully',
            'data' => $forwardRequest->fresh(),
        ]);
    }

    /**
     * Download forward attachment
     */
    public function downloadAttachment(ResearchForwardRequest $forwardRequest, $attachmentIndex)
    {
        $attachments = $forwardRequest->attachments ?? [];

        if (!isset($attachments[$attachmentIndex])) {
            return response()->json([
                'success' => false,
                'message' => 'Attachment not found',
            ], 404);
        }

        $attachment = $attachments[$attachmentIndex];
        $filePath = storage_path('app/public/' . $attachment['path']);

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->download($filePath, $attachment['filename']);
    }
}
