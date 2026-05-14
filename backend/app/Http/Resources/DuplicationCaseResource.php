<?php

namespace App\Http\Resources;

use App\Helpers\WorkflowHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DuplicationCaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $similarityLevel = WorkflowHelper::getSimilarityLevel($this->similarity_score);
        $recommendationBadge = WorkflowHelper::getRecommendationBadge($this->recommendation);

        return [
            'id' => $this->id,
            'request_item_id' => $this->request_item_id,
            'existing_technology' => $this->when($this->relationLoaded('existingTechnology'), function () {
                return [
                    'id' => $this->existingTechnology->id,
                    'name' => $this->existingTechnology->name,
                    'category' => $this->existingTechnology->category,
                    'owner_office' => $this->existingTechnology->owner_office,
                ];
            }),
            'similarity' => [
                'score' => $this->similarity_score,
                'level' => $similarityLevel['level'],
                'label' => $similarityLevel['label'],
                'color' => $similarityLevel['color'],
            ],
            'recommendation' => [
                'value' => $this->recommendation,
                'label' => $recommendationBadge['label'],
                'color' => $recommendationBadge['color'],
            ],
            'analysis_notes' => $this->analysis_notes,
            'analyzed_by' => $this->when($this->relationLoaded('analyzer'), function () {
                return [
                    'id' => $this->analyzer->id,
                    'name' => $this->analyzer->name,
                ];
            }),
            'timestamps' => [
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString(),
            ],
        ];
    }
}
