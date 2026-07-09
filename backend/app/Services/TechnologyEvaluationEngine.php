<?php

namespace App\Services;

use App\Models\TechnologyRequest;
use App\Models\TechnologyEvaluation;
use App\Models\User;
use App\Enums\EvaluationType;
use Illuminate\Support\Facades\Notification;

class TechnologyEvaluationEngine
{
    public function initiateEvaluations(TechnologyRequest $request, array $evaluationTypes = null): void
    {
        $types = $evaluationTypes ?? $this->getRequiredEvaluations($request);

        foreach ($types as $type) {
            $evaluationType = EvaluationType::from($type);
            $evaluator = $this->assignEvaluator($evaluationType);

            if ($evaluator) {
                TechnologyEvaluation::create([
                    'technology_request_id' => $request->id,
                    'evaluation_type' => $evaluationType,
                    'evaluator_id' => $evaluator->id,
                    'status' => 'pending',
                    'assigned_at' => now(),
                ]);
            }
        }
    }

    protected function getRequiredEvaluations(TechnologyRequest $request): array
    {
        $required = [
            EvaluationType::RISK_ASSESSMENT->value,
            EvaluationType::SECURITY_COMPLIANCE->value,
            EvaluationType::INTEROPERABILITY->value,
        ];

        if ($request->category === 'software' || $request->category === 'platform') {
            $required[] = EvaluationType::ARCHITECTURE_REVIEW->value;
            $required[] = EvaluationType::PERFORMANCE->value;
        }

        if ($request->estimated_cost > 100000) {
            $required[] = EvaluationType::FINANCIAL_ASSESSMENT->value;
        }

        $required[] = EvaluationType::LEGAL_COMPLIANCE->value;

        return $required;
    }

    protected function assignEvaluator(EvaluationType $type): ?User
    {
        $role = $type->requiredRole();
        return User::role($role)->inRandomOrder()->first();
    }

    public function areAllEvaluationsComplete(TechnologyRequest $request): bool
    {
        $total = $request->evaluations()->count();
        $completed = $request->evaluations()->where('status', 'completed')->count();

        return $total > 0 && $total === $completed;
    }

    public function getAggregateScore(TechnologyRequest $request): array
    {
        $evaluations = $request->evaluations()->where('status', 'completed')->get();

        if ($evaluations->isEmpty()) {
            return ['average_score' => 0, 'risk_level' => 'unknown'];
        }

        $avgScore = $evaluations->avg('score');
        $riskLevels = $evaluations->pluck('risk_level')->filter();
        $highestRisk = $this->determineHighestRisk($riskLevels->toArray());

        return [
            'average_score' => round($avgScore, 2),
            'risk_level' => $highestRisk,
            'total_evaluations' => $evaluations->count(),
        ];
    }

    protected function determineHighestRisk(array $risks): string
    {
        $priority = ['critical' => 4, 'high' => 3, 'medium' => 2, 'low' => 1];
        $highest = 'low';
        $highestValue = 0;

        foreach ($risks as $risk) {
            if (isset($priority[$risk]) && $priority[$risk] > $highestValue) {
                $highest = $risk;
                $highestValue = $priority[$risk];
            }
        }

        return $highest;
    }
}
