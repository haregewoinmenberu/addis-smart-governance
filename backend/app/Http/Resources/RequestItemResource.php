<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestItemResource extends JsonResource
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
            'code' => $this->code,
            'title' => $this->title,
            'category' => $this->category,
            'office' => $this->office,
            'status' => $this->status,
            'approval_status' => $this->approval_status,
            'priority' => $this->priority,
            'budget' => [
                'amount' => $this->budget,
                'formatted' => number_format($this->budget, 2) . ' ETB',
            ],
            'progress' => [
                'current_step' => $this->step,
                'total_steps' => $this->total_steps,
                'percentage' => $this->total_steps > 0 ? round(($this->step / $this->total_steps) * 100) : 0,
            ],
            'description' => $this->description,
            'justification' => $this->justification,
            'documents' => $this->documents,
            'submitted_by' => $this->when($this->relationLoaded('submittedBy'), function () {
                return [
                    'id' => $this->submittedBy->id,
                    'name' => $this->submittedBy->name,
                    'email' => $this->submittedBy->email,
                ];
            }),
            'workflow' => $this->when($this->relationLoaded('workflowInstance'), function () {
                return new WorkflowInstanceResource($this->workflowInstance);
            }),
            'duplication_case' => $this->when($this->relationLoaded('duplicationCase'), function () {
                return new DuplicationCaseResource($this->duplicationCase);
            }),
            'feasibility_study' => $this->when($this->relationLoaded('feasibilityStudy'), function () {
                return new FeasibilityStudyResource($this->feasibilityStudy);
            }),
            'timestamps' => [
                'submitted_at' => $this->submitted_at?->toISOString(),
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString(),
            ],
        ];
    }
}
