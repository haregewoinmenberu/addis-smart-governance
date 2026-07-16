<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchActivityLog;
use App\Models\User;
use App\Enums\IdeaStatus;
use Illuminate\Http\Request;

class SmartCityResearchController extends Controller
{
    /**
     * Smart City Command Center - View All Research Ideas
     * GET /api/smart-city/research/ideas
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Only Smart City Command Center can access
        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only Smart City Command Center can access this resource.'
            ], 403);
        }

        $query = ResearchIdea::with(['submitter',  'assignedToDirector', 'screenings']);

        // Filter by assignment status
        if ($request->has('assignment_status')) {
            $query->where('assignment_status', $request->assignment_status);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $ideas = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $ideas->items(),
            'pagination' => [
                'total' => $ideas->total(),
                'current_page' => $ideas->currentPage(),
                'last_page' => $ideas->lastPage(),
                'per_page' => $ideas->perPage(),
            ],
            'stats' => $this->getStats(),
        ]);
    }

    /**
     * Get dashboard statistics
     */
    private function getStats()
    {
        $byStatus = [];
        $statusCounts = ResearchIdea::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();
        
        foreach ($statusCounts as $item) {
            // Convert enum to string value for array key
            $statusKey = $item->status instanceof \BackedEnum ? $item->status->value : $item->status;
            $byStatus[$statusKey] = $item->count;
        }

        $byPriority = [];
        $priorityCounts = ResearchIdea::selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->get();
        
        foreach ($priorityCounts as $item) {
            // Convert enum to string value for array key
            $priorityKey = $item->priority instanceof \BackedEnum ? $item->priority->value : $item->priority;
            $byPriority[$priorityKey] = $item->count;
        }

        return [
            'total' => ResearchIdea::count(),
            'pending_review' => ResearchIdea::where('assignment_status', 'pending_smart_city')->count(),
            'assigned_to_director' => ResearchIdea::where('assignment_status', 'assigned_to_director')->count(),
            'in_research_review' => ResearchIdea::where('assignment_status', 'in_research_review')->count(),
            'by_status' => $byStatus,
            'by_priority' => $byPriority,
        ];
    }

    /**
     * View single research idea
     * GET /api/smart-city/research/ideas/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $idea = ResearchIdea::with([
            'submitter', 
            'assignedToSmartCity',
            'assignedToDirector',
            'attachments',
            'screenings.evaluator',
            'project'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $idea
        ]);
    }

    /**
     * Assign research idea to Research Director
     * POST /api/smart-city/research/ideas/{id}/assign-to-director
     */
    public function assignToDirector(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'director_id' => 'required|exists:users,id',
            'smart_city_notes' => 'nullable|string|max:1000',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
        ]);

        // Verify the user is a research director
        $director = User::findOrFail($validated['director_id']);
        if (!$director->hasRole('research_director')) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a Research Director.'
            ], 422);
        }

        $idea = ResearchIdea::findOrFail($id);

        $idea->update([
            'assigned_to_director' => $validated['director_id'],
            'director_assigned_at' => now(),
            'smart_city_notes' => $validated['smart_city_notes'] ?? $idea->smart_city_notes,
            'assignment_status' => 'assigned_to_director',
            'status' => IdeaStatus::UNDER_REVIEW,
            'priority' => $validated['priority'] ?? $idea->priority,
        ]);

        ResearchActivityLog::log(
            'assigned',
            $idea,
            null,
            ['assigned_to_director' => $validated['director_id']],
            'Research idea assigned to Research Director by Smart City Command Center'
        );

        return response()->json([
            'success' => true,
            'message' => 'Research idea assigned to Research Director successfully',
            'data' => $idea->fresh(['submitter', 'assignedToDirector', 'assignedToSmartCity'])
        ]);
    }

    /**
     * Update research idea status (Smart City review)
     * PUT /api/smart-city/research/ideas/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:draft,submitted,under_review,approved,rejected',
            'smart_city_notes' => 'nullable|string|max:1000',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
        ]);

        $idea = ResearchIdea::findOrFail($id);
        $oldStatus = $idea->status;

        $idea->update([
            'status' => $validated['status'],
            'smart_city_notes' => $validated['smart_city_notes'] ?? $idea->smart_city_notes,
            'priority' => $validated['priority'] ?? $idea->priority,
        ]);

        ResearchActivityLog::log(
            'status_updated',
            $idea,
            ['status' => $oldStatus],
            ['status' => $validated['status']],
            "Status changed from {$oldStatus} to {$validated['status']} by Smart City Command Center"
        );

        return response()->json([
            'success' => true,
            'message' => 'Research idea status updated successfully',
            'data' => $idea->fresh()
        ]);
    }

    /**
     * Add notes to research idea
     * POST /api/smart-city/research/ideas/{id}/notes
     */
    public function addNotes(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $idea = ResearchIdea::findOrFail($id);

        $idea->update([
            'smart_city_notes' => $validated['notes'],
        ]);

        ResearchActivityLog::log(
            'notes_added',
            $idea,
            null,
            ['notes' => $validated['notes']],
            'Smart City Command Center added notes to research idea'
        );

        return response()->json([
            'success' => true,
            'message' => 'Notes added successfully',
            'data' => $idea->fresh()
        ]);
    }

    /**
     * Reject research idea
     * POST /api/smart-city/research/ideas/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $idea = ResearchIdea::findOrFail($id);

        $idea->update([
            'status' => IdeaStatus::REJECTED,
            'smart_city_notes' => $validated['rejection_reason'],
            'assignment_status' => 'rejected',
        ]);

        ResearchActivityLog::log(
            'rejected',
            $idea,
            null,
            ['rejection_reason' => $validated['rejection_reason']],
            'Research idea rejected by Smart City Command Center'
        );

        return response()->json([
            'success' => true,
            'message' => 'Research idea rejected successfully',
            'data' => $idea->fresh()
        ]);
    }

    /**
     * Bulk assign multiple ideas to Research Director
     * POST /api/smart-city/research/ideas/bulk-assign
     */
    public function bulkAssign(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'idea_ids' => 'required|array|min:1',
            'idea_ids.*' => 'required|exists:research_ideas,id',
            'director_id' => 'required|exists:users,id',
            'smart_city_notes' => 'nullable|string|max:1000',
        ]);

        // Verify the user is a research director
        $director = User::findOrFail($validated['director_id']);
        if (!$director->hasRole('research_director')) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a Research Director.'
            ], 422);
        }

        $updated = ResearchIdea::whereIn('id', $validated['idea_ids'])
            ->update([
                'assigned_to_director' => $validated['director_id'],
                'director_assigned_at' => now(),
                'smart_city_notes' => $validated['smart_city_notes'] ?? null,
                'assignment_status' => 'assigned_to_director',
                'status' => IdeaStatus::UNDER_REVIEW,
            ]);

        \Log::info('Bulk research idea assignment', [
            'idea_ids' => $validated['idea_ids'],
            'director_id' => $validated['director_id'],
            'assigned_by' => $user->id,
            'count' => $updated,
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} research ideas assigned to Research Director successfully",
            'assigned_count' => $updated
        ]);
    }

    /**
     * Get analytics
     * GET /api/smart-city/research/analytics
     */
    public function analytics(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $byCategory = [];
        $categoryCounts = ResearchIdea::selectRaw('research_category, count(*) as count')
            ->groupBy('research_category')
            ->get();
        
        foreach ($categoryCounts as $item) {
            // Convert enum to string value for array key
            $categoryKey = $item->research_category instanceof \BackedEnum ? $item->research_category->value : $item->research_category;
            $byCategory[$categoryKey] = $item->count;
        }

        $byPriority = [];
        $priorityCounts = ResearchIdea::selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->get();
        
        foreach ($priorityCounts as $item) {
            // Convert enum to string value for array key
            $priorityKey = $item->priority instanceof \BackedEnum ? $item->priority->value : $item->priority;
            $byPriority[$priorityKey] = $item->count;
        }

        $stats = [
            'overview' => [
                'total' => ResearchIdea::count(),
                'pending_review' => ResearchIdea::where('assignment_status', 'pending_smart_city')->count(),
                'assigned_to_director' => ResearchIdea::where('assignment_status', 'assigned_to_director')->count(),
                'in_research_review' => ResearchIdea::where('assignment_status', 'in_research_review')->count(),
                'approved' => ResearchIdea::where('status', IdeaStatus::APPROVED)->count(),
                'rejected' => ResearchIdea::where('status', IdeaStatus::REJECTED)->count(),
            ],
            'by_category' => $byCategory,
            'by_priority' => $byPriority,
            'recent_activity' => [
                'today' => ResearchIdea::whereDate('created_at', today())->count(),
                'this_week' => ResearchIdea::whereDate('created_at', '>=', now()->subDays(7))->count(),
                'this_month' => ResearchIdea::whereDate('created_at', '>=', now()->subDays(30))->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
