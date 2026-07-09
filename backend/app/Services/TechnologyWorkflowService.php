<?php

namespace App\Services;

use App\Models\TechnologyRequest;
use App\Models\TechnologyWorkflowHistory;
use App\Models\TechnologyAuditLog;
use App\Enums\TechnologyStage;

class TechnologyWorkflowService
{
    public function transitionStage(TechnologyRequest $request, TechnologyStage $toStage, ?string $reason = null): void
    {
        $fromStage = $request->current_stage;

        if (!$fromStage->canTransitionTo($toStage)) {
            throw new \Exception("Cannot transition from {$fromStage->label()} to {$toStage->label()}");
        }

        TechnologyWorkflowHistory::create([
            'technology_request_id' => $request->id,
            'from_stage' => $fromStage,
            'to_stage' => $toStage,
            'reason' => $reason,
            'transitioned_by' => auth()->id(),
            'transitioned_at' => now(),
        ]);

        $request->update(['current_stage' => $toStage]);

        TechnologyAuditLog::log('stage_transition', $request, ['stage' => $fromStage->value], ['stage' => $toStage->value]);
    }

    public function rollback(TechnologyRequest $request, string $reason): void
    {
        if (!auth()->user()->hasAnyRole(['administrator', 'governance_committee'])) {
            throw new \Exception('Unauthorized to rollback');
        }

        $lastHistory = $request->workflowHistory()->latest('transitioned_at')->first();
        
        if (!$lastHistory || !$lastHistory->from_stage) {
            throw new \Exception('No previous stage to rollback to');
        }

        $this->transitionStage($request, $lastHistory->from_stage, "Rollback: {$reason}");
    }

    public function getAvailableTransitions(TechnologyRequest $request): array
    {
        $current = $request->current_stage;
        $next = $current->next();

        $transitions = [];
        if ($next) {
            $transitions[] = ['stage' => $next->value, 'label' => $next->label()];
        }

        return $transitions;
    }
}
