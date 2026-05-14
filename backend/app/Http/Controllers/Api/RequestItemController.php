<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequestItem;
use App\Models\WorkflowDefinition;
use App\Models\WorkflowInstance;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RequestItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RequestItem::with(['submittedBy', 'workflowInstance.definition'])
            ->orderByDesc('submitted_at');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('office', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by approval status
        if ($approvalStatus = $request->input('approval_status')) {
            $query->where('approval_status', $approvalStatus);
        }

        // Filter by priority
        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        // Filter by office
        if ($office = $request->input('office')) {
            $query->where('office', $office);
        }

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by user's sub-city (for Sub-City Admins)
        $user = auth()->user();
        if ($user && $user->isSubCityAdministrator() && $user->sub_city) {
            $query->where('office', $user->sub_city);
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $data = $query->paginate($perPage);

        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'office' => ['required', 'string'],
            'priority' => ['required', 'in:Low,Medium,High,Critical'],
            'budget' => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
            'justification' => ['required', 'string'],
            'documents' => ['nullable', 'array'],
        ]);

        // Generate unique code
        $data['code'] = 'TR-' . date('Y') . '-' . str_pad(RequestItem::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['submitted_by'] = auth()->id();
        $data['status'] = 'Draft';
        $data['approval_status'] = 'draft';
        $data['step'] = 0;
        $data['total_steps'] = 8;
        $data['submitted_at'] = now();

        $item = RequestItem::create($data);

        ActivityLog::log('create', 'requests', $item, null, $data);

        return response()->json([
            'message' => 'Request created successfully',
            'data' => $item->load('submittedBy'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $item = RequestItem::with([
            'submittedBy',
            'workflowInstance.definition',
            'workflowInstance.approvals.approver',
            'duplicationCase.existingTechnology',
            'feasibilityStudy.evaluator',
        ])->findOrFail($id);

        return response()->json(['data' => $item]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = RequestItem::findOrFail($id);

        // Check if user can edit
        $user = auth()->user();
        if (!$user->isITDBAdministrator() && $item->submitted_by !== $user->id) {
            return response()->json([
                'message' => 'You can only edit your own requests',
            ], 403);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string'],
            'office' => ['sometimes', 'string'],
            'priority' => ['sometimes', 'in:Low,Medium,High,Critical'],
            'budget' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['sometimes', 'string'],
            'justification' => ['sometimes', 'string'],
            'documents' => ['nullable', 'array'],
            'status' => ['sometimes', 'string'],
        ]);

        $oldValues = $item->toArray();
        $item->update($data);

        ActivityLog::log('update', 'requests', $item, $oldValues, $item->toArray());

        return response()->json([
            'message' => 'Request updated successfully',
            'data' => $item->load('submittedBy'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = RequestItem::findOrFail($id);

        // Check if user can delete
        $user = auth()->user();
        if (!$user->isITDBAdministrator() && $item->submitted_by !== $user->id) {
            return response()->json([
                'message' => 'You can only delete your own requests',
            ], 403);
        }

        // Cannot delete if workflow is in progress
        if ($item->workflowInstance && $item->workflowInstance->status === 'in_progress') {
            return response()->json([
                'message' => 'Cannot delete request with active workflow',
            ], 422);
        }

        ActivityLog::log('delete', 'requests', $item, $item->toArray(), null);

        $item->delete();

        return response()->json(['message' => 'Request deleted successfully']);
    }

    /**
     * Submit request for approval (starts workflow).
     */
    public function submit(string $id)
    {
        $item = RequestItem::findOrFail($id);

        // Check if already submitted
        if ($item->approval_status !== 'draft') {
            return response()->json([
                'message' => 'Request has already been submitted',
            ], 422);
        }

        // Get workflow definition
        $workflow = WorkflowDefinition::where('code', 'tech_request_approval')
            ->where('is_active', true)
            ->first();

        if (!$workflow) {
            return response()->json([
                'message' => 'No active workflow found',
            ], 422);
        }

        // Create workflow instance
        $instance = WorkflowInstance::create([
            'workflow_definition_id' => $workflow->id,
            'workflowable_type' => RequestItem::class,
            'workflowable_id' => $item->id,
            'current_stage' => $workflow->stages[0]['name'],
            'current_stage_index' => 0,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        // Create first approval record
        $instance->approvals()->create([
            'stage_name' => $workflow->stages[0]['name'],
            'stage_index' => 0,
            'action' => 'pending',
        ]);

        // Update request
        $item->update([
            'workflow_instance_id' => $instance->id,
            'status' => 'Submitted',
            'approval_status' => 'pending',
            'step' => 1,
        ]);

        ActivityLog::log('submit', 'requests', $item);

        return response()->json([
            'message' => 'Request submitted successfully',
            'data' => $item->load('workflowInstance.definition'),
        ]);
    }

    /**
     * Get request statistics.
     */
    public function statistics()
    {
        $user = auth()->user();
        $query = RequestItem::query();

        // Filter by sub-city for Sub-City Admins
        if ($user->isSubCityAdministrator() && $user->sub_city) {
            $query->where('office', $user->sub_city);
        }

        $total = $query->count();
        $draft = (clone $query)->where('approval_status', 'draft')->count();
        $pending = (clone $query)->where('approval_status', 'pending')->count();
        $approved = (clone $query)->where('approval_status', 'approved')->count();
        $rejected = (clone $query)->where('approval_status', 'rejected')->count();

        return response()->json([
            'data' => [
                'total' => $total,
                'draft' => $draft,
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
                'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
            ],
        ]);
    }
}
