<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFormSubmission;
use App\Models\User;
use Illuminate\Http\Request;

class SmartCityServiceRequestController extends Controller
{
    /**
     * Smart City Command Center - View All Service Requests
     * GET /api/smart-city/service-requests
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

        $query = ServiceFormSubmission::with(['institution', 'submittedBy', 'reviewedBy']);

        // Filter by service type
        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by institution
        if ($request->has('institution_id')) {
            $query->where('institution_id', $request->institution_id);
        }

        // Search by reference number, name, or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('submitted_name', 'like', "%{$search}%")
                  ->orWhere('submitted_email', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'submission_timestamp');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $submissions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $submissions->items(),
            'pagination' => [
                'total' => $submissions->total(),
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'per_page' => $submissions->perPage(),
            ],
            'stats' => $this->getStats(),
        ]);
    }

    /**
     * Get dashboard statistics
     */
    private function getStats()
    {
        $byServiceType = [];
        $serviceTypeCounts = ServiceFormSubmission::selectRaw('service_type, count(*) as count')
            ->groupBy('service_type')
            ->get();
        
        foreach ($serviceTypeCounts as $item) {
            $byServiceType[$item->service_type] = $item->count;
        }

        $byStatus = [];
        $statusCounts = ServiceFormSubmission::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();
        
        foreach ($statusCounts as $item) {
            $byStatus[$item->status] = $item->count;
        }

        return [
            'total' => ServiceFormSubmission::count(),
            'pending' => ServiceFormSubmission::where('status', 'pending')->count(),
            'under_review' => ServiceFormSubmission::where('status', 'under_review')->count(),
            'approved' => ServiceFormSubmission::where('status', 'approved')->count(),
            'rejected' => ServiceFormSubmission::where('status', 'rejected')->count(),
            'by_service_type' => $byServiceType,
            'by_status' => $byStatus,
        ];
    }

    /**
     * View single service request
     * GET /api/smart-city/service-requests/{id}
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

        $submission = ServiceFormSubmission::with([
            'institution',
            'submittedBy',
            'reviewedBy'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $submission
        ]);
    }

    /**
     * Assign service request to a user/department
     * POST /api/smart-city/service-requests/{id}/assign
     */
    public function assign(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $assignedUser = User::findOrFail($validated['assigned_to']);

        $submission = ServiceFormSubmission::findOrFail($id);

        \App\Models\ServiceRequestAssignment::updateOrCreate(
            ['service_request_id' => $submission->id, 'assignment_type' => 'officer'],
            [
                'assigned_by' => $user->id,
                'assigned_to' => $validated['assigned_to'],
                'assignment_notes' => $validated['notes'] ?? null,
                'assigned_date' => now(),
                'status' => 'pending',
            ]
        );

        $submission->update([
            'status' => 'under_review',
            'review_notes' => $validated['notes'] ?? $submission->review_notes,
        ]);

        \Log::info('Service request assigned by Smart City', [
            'submission_id' => $id,
            'reference_number' => $submission->reference_number,
            'assigned_to' => $validated['assigned_to'],
            'assigned_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request assigned to ' . $assignedUser->name . ' successfully',
            'data' => $submission->fresh(['institution', 'submittedBy', 'reviewedBy', 'assignments.assignedTo'])
        ]);
    }

    /**
     * Update service request status
     * PUT /api/smart-city/service-requests/{id}/status
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
            'status' => 'required|string|in:pending,under_review,approved,rejected',
            'review_notes' => 'nullable|string|max:1000',
        ]);

        $submission = ServiceFormSubmission::findOrFail($id);
        $oldStatus = $submission->status;

        $updateData = [
            'status' => $validated['status'],
        ];

        if (isset($validated['review_notes'])) {
            $updateData['review_notes'] = $validated['review_notes'];
        }

        if (in_array($validated['status'], ['approved', 'rejected'])) {
            $updateData['reviewed_by'] = $user->id;
            $updateData['reviewed_at'] = now();
        }

        $submission->update($updateData);

        \Log::info('Service request status updated by Smart City', [
            'submission_id' => $id,
            'reference_number' => $submission->reference_number,
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request status updated successfully',
            'data' => $submission->fresh()
        ]);
    }

    /**
     * Add notes to service request
     * POST /api/smart-city/service-requests/{id}/notes
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

        $submission = ServiceFormSubmission::findOrFail($id);

        $submission->update([
            'review_notes' => $validated['notes'],
        ]);

        \Log::info('Notes added to service request by Smart City', [
            'submission_id' => $id,
            'reference_number' => $submission->reference_number,
            'added_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notes added successfully',
            'data' => $submission->fresh()
        ]);
    }

    /**
     * Approve service request
     * POST /api/smart-city/service-requests/{id}/approve
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'approval_notes' => 'nullable|string|max:1000',
        ]);

        $submission = ServiceFormSubmission::findOrFail($id);

        $submission->update([
            'status' => 'approved',
            'review_notes' => $validated['approval_notes'] ?? $submission->review_notes,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        \Log::info('Service request approved by Smart City', [
            'submission_id' => $id,
            'reference_number' => $submission->reference_number,
            'approved_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request approved successfully',
            'data' => $submission->fresh()
        ]);
    }

    /**
     * Reject service request
     * POST /api/smart-city/service-requests/{id}/reject
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

        $submission = ServiceFormSubmission::findOrFail($id);

        $submission->update([
            'status' => 'rejected',
            'review_notes' => $validated['rejection_reason'],
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        \Log::info('Service request rejected by Smart City', [
            'submission_id' => $id,
            'reference_number' => $submission->reference_number,
            'rejected_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request rejected successfully',
            'data' => $submission->fresh()
        ]);
    }

    /**
     * Bulk assign multiple service requests
     * POST /api/smart-city/service-requests/bulk-assign
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
            'submission_ids' => 'required|array|min:1',
            'submission_ids.*' => 'required|exists:service_form_submissions,id',
            'assigned_to' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $assignedUser = User::findOrFail($validated['assigned_to']);

        $submissions = ServiceFormSubmission::whereIn('id', $validated['submission_ids'])->get();

        foreach ($submissions as $submission) {
            \App\Models\ServiceRequestAssignment::updateOrCreate(
                ['service_request_id' => $submission->id, 'assignment_type' => 'officer'],
                [
                    'assigned_by' => $user->id,
                    'assigned_to' => $validated['assigned_to'],
                    'assignment_notes' => $validated['notes'] ?? null,
                    'assigned_date' => now(),
                    'status' => 'pending',
                ]
            );

            $submission->update([
                'status' => 'under_review',
                'review_notes' => $validated['notes'] ?? $submission->review_notes,
            ]);
        }

        \Log::info('Bulk service request assignment by Smart City', [
            'submission_ids' => $validated['submission_ids'],
            'assigned_to' => $validated['assigned_to'],
            'assigned_by' => $user->id,
            'count' => count($validated['submission_ids']),
        ]);

        return response()->json([
            'success' => true,
            'message' => count($validated['submission_ids']) . ' service requests assigned to ' . $assignedUser->name . ' successfully',
            'assigned_count' => count($validated['submission_ids'])
        ]);
    }

    /**
     * Get analytics
     * GET /api/smart-city/service-requests/analytics
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

        $byServiceType = [];
        $serviceTypeCounts = ServiceFormSubmission::selectRaw('service_type, count(*) as count')
            ->groupBy('service_type')
            ->get();
        
        foreach ($serviceTypeCounts as $item) {
            $byServiceType[$item->service_type] = $item->count;
        }

        $byStatus = [];
        $statusCounts = ServiceFormSubmission::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();
        
        foreach ($statusCounts as $item) {
            $byStatus[$item->status] = $item->count;
        }

        $stats = [
            'overview' => [
                'total' => ServiceFormSubmission::count(),
                'pending' => ServiceFormSubmission::where('status', 'pending')->count(),
                'under_review' => ServiceFormSubmission::where('status', 'under_review')->count(),
                'approved' => ServiceFormSubmission::where('status', 'approved')->count(),
                'rejected' => ServiceFormSubmission::where('status', 'rejected')->count(),
            ],
            'by_service_type' => $byServiceType,
            'by_status' => $byStatus,
            'recent_activity' => [
                'today' => ServiceFormSubmission::whereDate('submission_timestamp', today())->count(),
                'this_week' => ServiceFormSubmission::whereDate('submission_timestamp', '>=', now()->subDays(7))->count(),
                'this_month' => ServiceFormSubmission::whereDate('submission_timestamp', '>=', now()->subDays(30))->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
