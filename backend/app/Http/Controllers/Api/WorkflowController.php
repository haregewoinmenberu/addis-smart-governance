<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkflowDefinition;
use App\Models\WorkflowInstance;
use App\Models\WorkflowApproval;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    /**
     * Display a listing of workflow definitions.
     */
    public function index()
    {
        $workflows = WorkflowDefinition::with('creator')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'data' => $workflows->map(fn($workflow) => [
                'id' => $workflow->id,
                'name' => $workflow->name,
                'code' => $workflow->code,
                'description' => $workflow->description,
                'entity_type' => $workflow->entity_type,
                'stages_count' => count($workflow->stages),
                'is_active' => $workflow->is_active,
                'instances_count' => $workflow->instances()->count(),
                'created_by' => $workflow->creator?->name,
                'created_at' => $workflow->created_at,
            ]),
        ]);
    }

    /**
     * Store a newly created workflow definition.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'unique:workflow_definitions,code'],
            'description' => ['nullable', 'string'],
            'entity_type' => ['required', 'string'],
            'stages' => ['required', 'array', 'min:1'],
            'stages.*.name' => ['required', 'string'],
            'stages.*.display_name' => ['required', 'string'],
            'stages.*.description' => ['nullable', 'string'],
            'stages.*.order' => ['required', 'integer', 'min:1'],
            'stages.*.required_role' => ['nullable', 'string'],
            'stages.*.actions' => ['required', 'array'],
            'stages.*.auto_advance' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $data['created_by'] = auth()->id();

        $workflow = WorkflowDefinition::create($data);

        ActivityLog::log('create', 'workflows', $workflow);

        return response()->json([
            'message' => 'Workflow created successfully',
            'data' => $workflow,
        ], 201);
    }

    /**
     * Display the specified workflow definition.
     */
    public function show(string $id)
    {
        $workflow = WorkflowDefinition::with('creator', 'instances')->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $workflow->id,
                'name' => $workflow->name,
                'code' => $workflow->code,
                'description' => $workflow->description,
                'entity_type' => $workflow->entity_type,
                'stages' => $workflow->stages,
                'is_active' => $workflow->is_active,
                'created_by' => $workflow->creator,
                'instances' => $workflow->instances()->latest()->limit(10)->get(),
                'created_at' => $workflow->created_at,
            ],
        ]);
    }

    /**
     * Update the specified workflow definition.
     */
    public function update(Request $request, string $id)
    {
        $workflow = WorkflowDefinition::findOrFail($id);
        
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'stages' => ['sometimes', 'array', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        $oldValues = $workflow->toArray();
        $workflow->update($data);

        ActivityLog::log('update', 'workflows', $workflow, $oldValues, $workflow->toArray());

        return response()->json([
            'message' => 'Workflow updated successfully',
            'data' => $workflow,
        ]);
    }

    /**
     * Remove the specified workflow definition.
     */
    public function destroy(string $id)
    {
        $workflow = WorkflowDefinition::findOrFail($id);

        // Check if workflow has active instances
        if ($workflow->instances()->where('status', 'in_progress')->exists()) {
            return response()->json([
                'message' => 'Cannot delete workflow with active instances',
            ], 422);
        }

        ActivityLog::log('delete', 'workflows', $workflow, $workflow->toArray(), null);

        $workflow->delete();

        return response()->json(['message' => 'Workflow deleted successfully']);
    }

    /**
     * Get workflow instances.
     */
    public function instances(Request $request)
    {
        $query = WorkflowInstance::with('definition', 'workflowable', 'approvals.approver');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by workflow definition
        if ($request->has('workflow_id')) {
            $query->where('workflow_definition_id', $request->workflow_id);
        }

        // Filter by user's pending approvals
        if ($request->boolean('my_approvals')) {
            $user = auth()->user();
            $query->whereHas('approvals', function ($q) use ($user) {
                $q->where('action', 'pending')
                  ->whereHas('workflowInstance.definition', function ($wq) use ($user) {
                      // Check if current stage requires user's role
                      $roles = $user->roles->pluck('name')->toArray();
                      $wq->whereJsonContains('stages', function ($stage) use ($roles) {
                          return in_array($stage['required_role'] ?? null, $roles);
                      });
                  });
            });
        }

        $instances = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($instances);
    }

    /**
     * Get specific workflow instance.
     */
    public function showInstance(string $id)
    {
        $instance = WorkflowInstance::with([
            'definition',
            'workflowable',
            'approvals.approver',
        ])->findOrFail($id);

        return response()->json(['data' => $instance]);
    }

    /**
     * Approve workflow stage.
     */
    public function approve(Request $request, string $instanceId)
    {
        $instance = WorkflowInstance::findOrFail($instanceId);
        $user = auth()->user();
        
        $data = $request->validate([
            'comments' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Check if user has permission to approve this stage
        $currentStage = $instance->definition->getStage($instance->current_stage);
        $requiredRole = $currentStage['required_role'] ?? null;

        if ($requiredRole && !$user->hasRole($requiredRole)) {
            return response()->json([
                'message' => 'You do not have permission to approve this stage',
                'required_role' => $requiredRole,
                'your_roles' => $user->roles->pluck('name'),
                'current_stage' => $currentStage['display_name'] ?? $instance->current_stage,
            ], 403);
        }

        // Use WorkflowService
        $workflowService = app(\App\Services\WorkflowService::class);
        
        try {
            $updatedInstance = $workflowService->approveStage(
                $instance,
                $user->id,
                $data['comments'] ?? null,
                $data['metadata'] ?? null
            );

            return response()->json([
                'message' => 'Workflow stage approved successfully',
                'data' => $updatedInstance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve stage: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject workflow.
     */
    public function reject(Request $request, string $instanceId)
    {
        $instance = WorkflowInstance::findOrFail($instanceId);
        $user = auth()->user();
        
        $data = $request->validate([
            'comments' => ['required', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Check permission
        $currentStage = $instance->definition->getStage($instance->current_stage);
        $requiredRole = $currentStage['required_role'] ?? null;

        if ($requiredRole && !$user->hasRole($requiredRole)) {
            return response()->json([
                'message' => 'You do not have permission to reject this stage',
                'required_role' => $requiredRole,
            ], 403);
        }

        // Use WorkflowService
        $workflowService = app(\App\Services\WorkflowService::class);
        
        try {
            $updatedInstance = $workflowService->rejectWorkflow(
                $instance,
                $user->id,
                $data['comments'],
                $data['metadata'] ?? null
            );

            return response()->json([
                'message' => 'Workflow rejected',
                'data' => $updatedInstance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject workflow: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request revision.
     */
    public function requestRevision(Request $request, string $instanceId)
    {
        $instance = WorkflowInstance::findOrFail($instanceId);
        $user = auth()->user();
        
        $data = $request->validate([
            'comments' => ['required', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Check permission
        $currentStage = $instance->definition->getStage($instance->current_stage);
        $requiredRole = $currentStage['required_role'] ?? null;

        if ($requiredRole && !$user->hasRole($requiredRole)) {
            return response()->json([
                'message' => 'You do not have permission to request revision',
                'required_role' => $requiredRole,
            ], 403);
        }

        // Use WorkflowService
        $workflowService = app(\App\Services\WorkflowService::class);
        
        try {
            $updatedInstance = $workflowService->requestRevision(
                $instance,
                $user->id,
                $data['comments'],
                $data['metadata'] ?? null
            );

            return response()->json([
                'message' => 'Revision requested',
                'data' => $updatedInstance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to request revision: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel workflow (ITDB Administrator only).
     */
    public function cancel(Request $request, string $instanceId)
    {
        $instance = WorkflowInstance::findOrFail($instanceId);
        $user = auth()->user();
        
        // Only ITDB Administrator can cancel workflows
        if (!$user->isITDBAdministrator()) {
            return response()->json([
                'message' => 'Only ITDB Administrator can cancel workflows',
            ], 403);
        }

        $data = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        // Use WorkflowService
        $workflowService = app(\App\Services\WorkflowService::class);
        
        try {
            $updatedInstance = $workflowService->cancelWorkflow(
                $instance,
                $user->id,
                $data['reason']
            );

            return response()->json([
                'message' => 'Workflow cancelled',
                'data' => $updatedInstance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel workflow: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get pending approvals for current user.
     */
    public function myApprovals(Request $request)
    {
        $user = auth()->user();
        
        // Use WorkflowService
        $workflowService = app(\App\Services\WorkflowService::class);
        
        try {
            $pendingApprovals = $workflowService->getPendingApprovalsForUser($user->id);

            return response()->json([
                'data' => $pendingApprovals,
                'count' => $pendingApprovals->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch pending approvals: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get workflow analytics.
     */
    public function analytics()
    {
        $totalInstances = WorkflowInstance::count();
        $pendingInstances = WorkflowInstance::where('status', 'in_progress')->count();
        $approvedInstances = WorkflowInstance::where('status', 'approved')->count();
        $rejectedInstances = WorkflowInstance::where('status', 'rejected')->count();

        $avgCompletionTime = WorkflowInstance::whereNotNull('completed_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, started_at, completed_at)) as avg_hours')
            ->value('avg_hours');

        return response()->json([
            'data' => [
                'total_instances' => $totalInstances,
                'pending' => $pendingInstances,
                'approved' => $approvedInstances,
                'rejected' => $rejectedInstances,
                'avg_completion_hours' => round($avgCompletionTime ?? 0, 2),
                'approval_rate' => $totalInstances > 0 
                    ? round(($approvedInstances / $totalInstances) * 100, 2) 
                    : 0,
            ],
        ]);
    }
}
