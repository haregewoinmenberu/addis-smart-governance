<?php

namespace App\Http\Resources;

use App\Helpers\WorkflowHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowInstanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflow_definition' => [
                'id' => $this->definition->id,
                'name' => $this->definition->name,
                'code' => $this->definition->code,
                'total_stages' => count($this->definition->stages),
            ],
            'workflowable' => [
                'type' => class_basename($this->workflowable_type),
                'id' => $this->workflowable_id,
                'data' => $this->when($this->relationLoaded('workflowable'), function () {
                    return new RequestItemResource($this->workflowable);
                }),
            ],
            'current_stage' => [
                'name' => $this->current_stage,
                'display_name' => $this->definition->getStage($this->current_stage)['display_name'] ?? $this->current_stage,
                'index' => $this->current_stage_index,
                'required_role' => $this->definition->getStage($this->current_stage)['required_role'] ?? null,
                'icon' => WorkflowHelper::getStageIcon($this->current_stage),
            ],
            'status' => [
                'value' => $this->status,
                'label' => WorkflowHelper::getStatusDisplayName($this->status),
                'color' => WorkflowHelper::getStatusColor($this->status),
            ],
            'progress' => [
                'percentage' => WorkflowHelper::calculateProgress($this),
                'current_stage' => $this->current_stage_index + 1,
                'total_stages' => count($this->definition->stages),
            ],
            'approvals' => WorkflowApprovalResource::collection($this->whenLoaded('approvals')),
            'timeline' => $this->when($request->input('include_timeline'), function () {
                return WorkflowHelper::getTimeline($this->resource);
            }),
            'can_approve' => $this->when($request->user(), function () use ($request) {
                return WorkflowHelper::canUserApprove($this->resource, $request->user());
            }),
            'eligible_approvers' => $this->when($request->input('include_approvers'), function () {
                return UserResource::collection(WorkflowHelper::getEligibleApprovers($this->resource));
            }),
            'timestamps' => [
                'started_at' => $this->started_at?->toISOString(),
                'completed_at' => $this->completed_at?->toISOString(),
                'duration' => WorkflowHelper::formatDuration($this->started_at, $this->completed_at),
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString(),
            ],
        ];
    }
}
