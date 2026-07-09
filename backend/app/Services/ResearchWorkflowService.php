<?php

namespace App\Services;

use App\Models\ResearchProject;
use App\Models\ResearchWorkflowHistory;
use App\Enums\ResearchStage;
use Illuminate\Support\Facades\DB;

class ResearchWorkflowService
{
    public function transitionStage(ResearchProject $project, ResearchStage $toStage, ?string $reason = null): bool
    {
        if (!$project->canTransitionTo($toStage)) {
            throw new \Exception("Cannot transition from {$project->current_stage->label()} to {$toStage->label()}");
        }

        return DB::transaction(function () use ($project, $toStage, $reason) {
            $fromStage = $project->current_stage;

            ResearchWorkflowHistory::create([
                'research_project_id' => $project->id,
                'from_stage' => $fromStage,
                'to_stage' => $toStage,
                'transition_reason' => $reason,
                'transitioned_by' => auth()->id(),
                'transitioned_at' => now(),
            ]);

            $project->update(['current_stage' => $toStage]);

            return true;
        });
    }

    public function canRollback(ResearchProject $project): bool
    {
        return $project->current_stage->previous() !== null;
    }

    public function rollback(ResearchProject $project, ?string $reason = null): bool
    {
        $previousStage = $project->current_stage->previous();

        if (!$previousStage) {
            throw new \Exception("Cannot rollback from {$project->current_stage->label()}");
        }

        return DB::transaction(function () use ($project, $previousStage, $reason) {
            $fromStage = $project->current_stage;

            ResearchWorkflowHistory::create([
                'research_project_id' => $project->id,
                'from_stage' => $fromStage,
                'to_stage' => $previousStage,
                'transition_reason' => $reason ?? 'Rollback',
                'transitioned_by' => auth()->id(),
                'transitioned_at' => now(),
            ]);

            $project->update(['current_stage' => $previousStage]);

            return true;
        });
    }

    public function getWorkflowHistory(ResearchProject $project)
    {
        return $project->workflowHistory()
            ->with('transitioner')
            ->orderBy('transitioned_at', 'desc')
            ->get();
    }

    public function getAvailableTransitions(ResearchProject $project): array
    {
        $transitions = [];

        if ($nextStage = $project->current_stage->next()) {
            $transitions[] = [
                'stage' => $nextStage,
                'label' => $nextStage->label(),
                'type' => 'next',
            ];
        }

        if ($previousStage = $project->current_stage->previous()) {
            $transitions[] = [
                'stage' => $previousStage,
                'label' => $previousStage->label(),
                'type' => 'rollback',
            ];
        }

        return $transitions;
    }
}
