<?php

namespace App\Http\Resources;

use App\Helpers\WorkflowHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeasibilityStudyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $riskLevel = WorkflowHelper::getRiskLevel($this->overall_risk_score);

        return [
            'id' => $this->id,
            'request_item_id' => $this->request_item_id,
            'scores' => [
                'technical' => $this->technical_score,
                'financial' => $this->financial_score,
                'security' => $this->security_score,
                'infrastructure' => $this->infrastructure_score,
                'integration' => $this->integration_score,
                'sustainability' => $this->sustainability_score,
            ],
            'overall_risk' => [
                'score' => $this->overall_risk_score,
                'level' => $riskLevel['level'],
                'label' => $riskLevel['label'],
                'color' => $riskLevel['color'],
            ],
            'recommendation' => $this->recommendation,
            'evaluated_by' => $this->when($this->relationLoaded('evaluator'), function () {
                return [
                    'id' => $this->evaluator->id,
                    'name' => $this->evaluator->name,
                ];
            }),
            'timestamps' => [
                'evaluated_at' => $this->evaluated_at?->toISOString(),
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString(),
            ],
        ];
    }
}
