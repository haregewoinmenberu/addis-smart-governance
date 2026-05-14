<?php

namespace App\Services;

use App\Models\RequestItem;
use App\Models\FeasibilityStudy;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class FeasibilityEvaluationService
{
    /**
     * Evaluate request feasibility.
     */
    public function evaluateRequest(
        RequestItem $request,
        array $scores,
        ?string $recommendation = null,
        ?int $evaluatorId = null
    ): FeasibilityStudy {
        return DB::transaction(function () use ($request, $scores, $recommendation, $evaluatorId) {
            // Calculate overall risk score
            $overallScore = $this->calculateOverallRiskScore($scores);

            // Generate recommendation if not provided
            if (!$recommendation) {
                $recommendation = $this->generateRecommendation($overallScore, $scores);
            }

            // Create feasibility study
            $study = FeasibilityStudy::create([
                'request_item_id' => $request->id,
                'technical_score' => $scores['technical'] ?? null,
                'financial_score' => $scores['financial'] ?? null,
                'security_score' => $scores['security'] ?? null,
                'infrastructure_score' => $scores['infrastructure'] ?? null,
                'integration_score' => $scores['integration'] ?? null,
                'sustainability_score' => $scores['sustainability'] ?? null,
                'overall_risk_score' => $overallScore,
                'recommendation' => $recommendation,
                'evaluated_by' => $evaluatorId ?? auth()->id(),
                'evaluated_at' => now(),
            ]);

            // Log activity
            ActivityLog::log('feasibility_evaluation_completed', 'feasibility_studies', $study);

            // Send notification based on risk level
            $riskLevel = $this->determineRiskLevel($overallScore);
            if ($riskLevel === 'high') {
                app(NotificationService::class)->notifyHighRiskEvaluation($request, $study);
            }

            return $study;
        });
    }

    /**
     * Calculate overall risk score from individual scores.
     */
    protected function calculateOverallRiskScore(array $scores): float
    {
        $validScores = array_filter($scores, fn($score) => !is_null($score));

        if (empty($validScores)) {
            return 0;
        }

        // Weighted average
        $weights = [
            'technical' => 0.20,      // 20%
            'financial' => 0.20,      // 20%
            'security' => 0.20,       // 20%
            'infrastructure' => 0.15, // 15%
            'integration' => 0.15,    // 15%
            'sustainability' => 0.10, // 10%
        ];

        $weightedSum = 0;
        $totalWeight = 0;

        foreach ($scores as $key => $score) {
            if (!is_null($score) && isset($weights[$key])) {
                $weightedSum += $score * $weights[$key];
                $totalWeight += $weights[$key];
            }
        }

        return $totalWeight > 0 ? round($weightedSum / $totalWeight, 2) : 0;
    }

    /**
     * Determine risk level based on overall score.
     */
    protected function determineRiskLevel(float $score): string
    {
        if ($score >= 80) {
            return 'low';
        } elseif ($score >= 50) {
            return 'medium';
        } else {
            return 'high';
        }
    }

    /**
     * Generate recommendation based on scores.
     */
    protected function generateRecommendation(float $overallScore, array $scores): string
    {
        $riskLevel = $this->determineRiskLevel($overallScore);
        $recommendation = "FEASIBILITY EVALUATION SUMMARY\n\n";
        $recommendation .= "Overall Risk Score: {$overallScore}/100\n";
        $recommendation .= "Risk Level: " . strtoupper($riskLevel) . "\n\n";

        // Individual score analysis
        $recommendation .= "DETAILED ANALYSIS:\n\n";

        foreach ($scores as $criterion => $score) {
            if (!is_null($score)) {
                $status = $this->getScoreStatus($score);
                $recommendation .= ucfirst($criterion) . " Feasibility: {$score}/100 - {$status}\n";
            }
        }

        $recommendation .= "\n";

        // Overall recommendation
        if ($riskLevel === 'low') {
            $recommendation .= "RECOMMENDATION: APPROVE\n\n";
            $recommendation .= "The request demonstrates strong feasibility across all evaluated criteria. ";
            $recommendation .= "Technical implementation is viable, financial resources are adequate, ";
            $recommendation .= "security measures are robust, and infrastructure requirements can be met. ";
            $recommendation .= "Proceed with implementation as planned.\n\n";
            $recommendation .= "Next Steps:\n";
            $recommendation .= "- Finalize budget allocation\n";
            $recommendation .= "- Prepare implementation timeline\n";
            $recommendation .= "- Assign project team\n";
            $recommendation .= "- Begin vendor selection process\n";
        } elseif ($riskLevel === 'medium') {
            $recommendation .= "RECOMMENDATION: APPROVE WITH CONDITIONS\n\n";
            $recommendation .= "The request shows moderate feasibility with some areas requiring attention. ";
            $recommendation .= "Address the following concerns before proceeding:\n\n";

            // Identify weak areas
            $weakAreas = [];
            foreach ($scores as $criterion => $score) {
                if (!is_null($score) && $score < 60) {
                    $weakAreas[] = ucfirst($criterion);
                }
            }

            if (!empty($weakAreas)) {
                $recommendation .= "Areas Requiring Improvement:\n";
                foreach ($weakAreas as $area) {
                    $recommendation .= "- {$area}: Develop mitigation strategies\n";
                }
            }

            $recommendation .= "\nNext Steps:\n";
            $recommendation .= "- Address identified concerns\n";
            $recommendation .= "- Develop risk mitigation plan\n";
            $recommendation .= "- Secure additional resources if needed\n";
            $recommendation .= "- Re-evaluate after improvements\n";
        } else {
            $recommendation .= "RECOMMENDATION: REJECT OR MAJOR REVISION REQUIRED\n\n";
            $recommendation .= "The request demonstrates significant feasibility concerns that pose high risk. ";
            $recommendation .= "Current evaluation indicates the project may not be viable without substantial changes.\n\n";

            // Identify critical issues
            $criticalIssues = [];
            foreach ($scores as $criterion => $score) {
                if (!is_null($score) && $score < 50) {
                    $criticalIssues[] = ucfirst($criterion);
                }
            }

            if (!empty($criticalIssues)) {
                $recommendation .= "Critical Issues:\n";
                foreach ($criticalIssues as $issue) {
                    $recommendation .= "- {$issue}: Requires fundamental redesign\n";
                }
            }

            $recommendation .= "\nRecommended Actions:\n";
            $recommendation .= "- Conduct comprehensive risk assessment\n";
            $recommendation .= "- Explore alternative solutions\n";
            $recommendation .= "- Reassess project scope and objectives\n";
            $recommendation .= "- Consider deferring until conditions improve\n";
        }

        return $recommendation;
    }

    /**
     * Get score status description.
     */
    protected function getScoreStatus(float $score): string
    {
        if ($score >= 80) {
            return 'Excellent';
        } elseif ($score >= 70) {
            return 'Good';
        } elseif ($score >= 60) {
            return 'Acceptable';
        } elseif ($score >= 50) {
            return 'Marginal';
        } else {
            return 'Poor';
        }
    }

    /**
     * Update feasibility study.
     */
    public function updateEvaluation(
        FeasibilityStudy $study,
        array $scores,
        ?string $recommendation = null,
        ?int $evaluatorId = null
    ): FeasibilityStudy {
        $oldValues = $study->toArray();

        // Calculate new overall score
        $overallScore = $this->calculateOverallRiskScore($scores);

        // Generate recommendation if not provided
        if (!$recommendation) {
            $recommendation = $this->generateRecommendation($overallScore, $scores);
        }

        $study->update([
            'technical_score' => $scores['technical'] ?? $study->technical_score,
            'financial_score' => $scores['financial'] ?? $study->financial_score,
            'security_score' => $scores['security'] ?? $study->security_score,
            'infrastructure_score' => $scores['infrastructure'] ?? $study->infrastructure_score,
            'integration_score' => $scores['integration'] ?? $study->integration_score,
            'sustainability_score' => $scores['sustainability'] ?? $study->sustainability_score,
            'overall_risk_score' => $overallScore,
            'recommendation' => $recommendation,
            'evaluated_by' => $evaluatorId ?? $study->evaluated_by,
            'evaluated_at' => now(),
        ]);

        ActivityLog::log('feasibility_evaluation_updated', 'feasibility_studies', $study, $oldValues, $study->toArray());

        return $study;
    }

    /**
     * Get evaluation criteria template.
     */
    public function getEvaluationCriteria(): array
    {
        return [
            'technical' => [
                'name' => 'Technical Feasibility',
                'description' => 'Assess technical viability, complexity, and implementation challenges',
                'factors' => [
                    'Technology maturity and availability',
                    'Technical expertise required',
                    'Development complexity',
                    'Testing and quality assurance requirements',
                    'Technical dependencies',
                ],
            ],
            'financial' => [
                'name' => 'Financial Feasibility',
                'description' => 'Evaluate budget adequacy, cost-benefit ratio, and financial sustainability',
                'factors' => [
                    'Initial investment requirements',
                    'Operational costs',
                    'Return on investment (ROI)',
                    'Budget availability',
                    'Cost-benefit analysis',
                ],
            ],
            'security' => [
                'name' => 'Security Assessment',
                'description' => 'Evaluate security risks, compliance, and data protection measures',
                'factors' => [
                    'Data security and privacy',
                    'Compliance with regulations',
                    'Vulnerability assessment',
                    'Access control mechanisms',
                    'Incident response capabilities',
                ],
            ],
            'infrastructure' => [
                'name' => 'Infrastructure Readiness',
                'description' => 'Assess infrastructure requirements and availability',
                'factors' => [
                    'Hardware requirements',
                    'Network infrastructure',
                    'Data center capabilities',
                    'Scalability considerations',
                    'Disaster recovery provisions',
                ],
            ],
            'integration' => [
                'name' => 'Integration Complexity',
                'description' => 'Evaluate integration with existing systems and processes',
                'factors' => [
                    'System compatibility',
                    'API availability and quality',
                    'Data migration requirements',
                    'Process integration',
                    'Interoperability standards',
                ],
            ],
            'sustainability' => [
                'name' => 'Sustainability Analysis',
                'description' => 'Assess long-term viability and maintenance requirements',
                'factors' => [
                    'Vendor stability and support',
                    'Technology lifecycle',
                    'Maintenance requirements',
                    'Upgrade path',
                    'Knowledge transfer and training',
                ],
            ],
        ];
    }

    /**
     * Get feasibility statistics.
     */
    public function getStatistics(): array
    {
        $total = FeasibilityStudy::count();
        $lowRisk = FeasibilityStudy::where('overall_risk_score', '>=', 80)->count();
        $mediumRisk = FeasibilityStudy::whereBetween('overall_risk_score', [50, 79.99])->count();
        $highRisk = FeasibilityStudy::where('overall_risk_score', '<', 50)->count();

        $avgScores = FeasibilityStudy::selectRaw('
            AVG(technical_score) as avg_technical,
            AVG(financial_score) as avg_financial,
            AVG(security_score) as avg_security,
            AVG(infrastructure_score) as avg_infrastructure,
            AVG(integration_score) as avg_integration,
            AVG(sustainability_score) as avg_sustainability,
            AVG(overall_risk_score) as avg_overall
        ')->first();

        return [
            'total_evaluations' => $total,
            'risk_distribution' => [
                'low' => $lowRisk,
                'medium' => $mediumRisk,
                'high' => $highRisk,
            ],
            'average_scores' => [
                'technical' => round($avgScores->avg_technical ?? 0, 2),
                'financial' => round($avgScores->avg_financial ?? 0, 2),
                'security' => round($avgScores->avg_security ?? 0, 2),
                'infrastructure' => round($avgScores->avg_infrastructure ?? 0, 2),
                'integration' => round($avgScores->avg_integration ?? 0, 2),
                'sustainability' => round($avgScores->avg_sustainability ?? 0, 2),
                'overall' => round($avgScores->avg_overall ?? 0, 2),
            ],
        ];
    }
}
