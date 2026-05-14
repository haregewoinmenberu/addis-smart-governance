<?php

namespace App\Http\Resources;

use App\Helpers\WorkflowHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowApprovalResource extends JsonResource
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
            'stage' => [
                'name' => $this->stage_name,
                'index' => $this->stage_index,
                'icon' => WorkflowHelper::getStageIcon($this->stage_name),
            ],
            'approver' => $this->when($this->approver, function () {
                return [
                    'id' => $this->approver->id,
                    'name' => $this->approver->name,
                    'email' => $this->approver->email,
                    'roles' => $this->approver->roles->pluck('display_name'),
                ];
            }),
            'action' => [
                'value' => $this->action,
                'label' => WorkflowHelper::getActionDisplayName($this->action),
                'color' => WorkflowHelper::getActionColor($this->action),
            ],
            'comments' => $this->comments,
            'metadata' => $this->metadata,
            'timestamps' => [
                'actioned_at' => $this->actioned_at?->toISOString(),
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString(),
            ],
        ];
    }
}
