<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFormSubmission;
use App\Models\User;
use Illuminate\Http\Request;

class SmartCityServiceManagementController extends Controller
{
    /**
     * Smart City Command Center - View All Service Requests
     * GET /api/smart-city/services
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

        $query = ServiceFormSubmission::with(['submittedBy', 'reviewedBy', 'institution']);

        // Filter by service type
        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
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

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('submission_timestamp', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('submission_timestamp', '<=', $request->to_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
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
                'from' => $submissions->firstItem(),
                'to' => $submissions->lastItem(),
            ],
            'stats' => $this->getStats(),
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        return [
            'total' => ServiceFormSubmission::count(),
            'pending' => ServiceFormSubmission::where('status', 'pending')->count(),
            'under_review' => ServiceFormSubmission::where('status', 'under_review')->count(),
            'approved' => ServiceFormSubmission::where('status', 'approved')->count(),
            'rejected' => ServiceFormSubmission::where('status', 'rejected')->count(),
            'by_service_type' => ServiceFormSubmission::selectRaw('service_type, count(*) as count')
                ->groupBy('service_type')
                ->get()
                ->pluck('count', 'service_type'),
            'recent_submissions' => ServiceFormSubmission::whereDate('submission_timestamp', '>=', now()->subDays(7))->count(),
        ];
    }

    /**
     * View single service request
     * GET /api/smart-city/services/{id}
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
            'submittedBy',
            'reviewedBy',
            'institution'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $submission
        ]);
    }

    /**
     * Update service request status
     * PUT /api/smart-city/services/{id}/status
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
            'status' => 'required|string|in:pending,under_review,approved,rejected,on_hold,processing,completed',
            'review_notes' => 'nullable|string|max:1000',
        ]);

        $submission = ServiceFormSubmission::findOrFail($id);
        
        $oldStatus = $submission->status;

        $submission->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'] ?? $submission->review_notes,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        // Log the status change
        \Log::info('Service request status updated', [
            'submission_id' => $submission->id,
            'reference_number' => $submission->reference_number,
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
            'updated_by' => $user->id,
        ]);

        // TODO: Send notification to submitter
        // Notify::send($submission->submittedBy, new StatusUpdatedNotification($submission));

        return response()->json([
            'success' => true,
            'message' => 'Service request status updated successfully',
            'data' => $submission->fresh(['submittedBy', 'reviewedBy'])
        ]);
    }

    /**
     * Assign service request to another user/department
     * POST /api/smart-city/services/{id}/assign
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
            'assignment_notes' => 'nullable|string|max:500',
        ]);

        $submission = ServiceFormSubmission::findOrFail($id);

        \App\Models\ServiceRequestAssignment::updateOrCreate(
            ['service_request_id' => $submission->id, 'assignment_type' => 'officer'],
            [
                'assigned_by' => $user->id,
                'assigned_to' => $validated['assigned_to'],
                'assignment_notes' => $validated['assignment_notes'] ?? null,
                'assigned_date' => now(),
                'status' => 'pending',
            ]
        );

        $submission->update(['status' => 'processing']);

        \Log::info('Service request assigned', [
            'submission_id' => $submission->id,
            'reference_number' => $submission->reference_number,
            'assigned_to' => $validated['assigned_to'],
            'assigned_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request assigned successfully',
            'data' => $submission->fresh()
        ]);
    }

    /**
     * Add review notes/comments
     * POST /api/smart-city/services/{id}/notes
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
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        \Log::info('Review notes added', [
            'submission_id' => $submission->id,
            'reference_number' => $submission->reference_number,
            'reviewed_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notes added successfully',
            'data' => $submission->fresh()
        ]);
    }

    /**
     * Bulk update status for multiple submissions
     * POST /api/smart-city/services/bulk-update-status
     */
    public function bulkUpdateStatus(Request $request)
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
            'status' => 'required|string|in:pending,under_review,approved,rejected,on_hold,processing,completed',
            'review_notes' => 'nullable|string|max:1000',
        ]);

        $updated = ServiceFormSubmission::whereIn('id', $validated['submission_ids'])
            ->update([
                'status' => $validated['status'],
                'review_notes' => $validated['review_notes'] ?? null,
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

        \Log::info('Bulk status update', [
            'submission_ids' => $validated['submission_ids'],
            'status' => $validated['status'],
            'updated_count' => $updated,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} service requests updated successfully",
            'updated_count' => $updated
        ]);
    }

    /**
     * Delete service request (soft delete)
     * DELETE /api/smart-city/services/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $submission = ServiceFormSubmission::findOrFail($id);
        $referenceNumber = $submission->reference_number;

        $submission->delete();

        \Log::warning('Service request deleted', [
            'submission_id' => $id,
            'reference_number' => $referenceNumber,
            'deleted_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request deleted successfully'
        ]);
    }

    /**
     * Export service requests to CSV/Excel
     * GET /api/smart-city/services/export
     */
    public function export(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('smart_city_command')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $query = ServiceFormSubmission::with(['submittedBy', 'reviewedBy']);

        // Apply same filters as index method
        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('from_date')) {
            $query->whereDate('submission_timestamp', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('submission_timestamp', '<=', $request->to_date);
        }

        $submissions = $query->get();

        // TODO: Implement Excel export using Laravel Excel or similar
        // return Excel::download(new ServiceSubmissionsExport($submissions), 'service-requests.xlsx');

        return response()->json([
            'success' => true,
            'message' => 'Export functionality coming soon',
            'count' => $submissions->count()
        ]);
    }

    /**
     * Get statistics and analytics
     * GET /api/smart-city/services/analytics
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

        $stats = [
            'overview' => [
                'total' => ServiceFormSubmission::count(),
                'pending' => ServiceFormSubmission::where('status', 'pending')->count(),
                'under_review' => ServiceFormSubmission::where('status', 'under_review')->count(),
                'approved' => ServiceFormSubmission::where('status', 'approved')->count(),
                'rejected' => ServiceFormSubmission::where('status', 'rejected')->count(),
            ],
            'by_service_type' => ServiceFormSubmission::selectRaw('service_type, status, count(*) as count')
                ->groupBy('service_type', 'status')
                ->get()
                ->groupBy('service_type')
                ->map(function ($items) {
                    return $items->pluck('count', 'status');
                }),
            'recent_activity' => [
                'today' => ServiceFormSubmission::whereDate('submission_timestamp', today())->count(),
                'this_week' => ServiceFormSubmission::whereDate('submission_timestamp', '>=', now()->subDays(7))->count(),
                'this_month' => ServiceFormSubmission::whereDate('submission_timestamp', '>=', now()->subDays(30))->count(),
            ],
            'monthly_trend' => ServiceFormSubmission::selectRaw('DATE_FORMAT(submission_timestamp, "%Y-%m") as month, count(*) as count')
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
