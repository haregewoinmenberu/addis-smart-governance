<?php

namespace App\Services;

use App\Models\RequestItem;
use App\Models\Technology;
use App\Models\DuplicationCase;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class DuplicationAnalysisService
{
    /**
     * Analyze request for potential duplications.
     */
    public function analyzeRequest(RequestItem $request): DuplicationCase
    {
        return DB::transaction(function () use ($request) {
            // Search for similar technologies
            $similarTechnologies = $this->findSimilarTechnologies($request);

            if ($similarTechnologies->isEmpty()) {
                // No duplication found
                return $this->createDuplicationCase($request, null, 0, 'new', 'No similar technologies found. Proceed as new request.');
            }

            // Get the most similar technology
            $mostSimilar = $similarTechnologies->first();
            $similarityScore = $this->calculateSimilarityScore($request, $mostSimilar);

            // Determine recommendation based on similarity score
            $recommendation = $this->determineRecommendation($similarityScore);
            $analysisNotes = $this->generateAnalysisNotes($request, $mostSimilar, $similarityScore);

            // Create duplication case
            $case = $this->createDuplicationCase(
                $request,
                $mostSimilar,
                $similarityScore,
                $recommendation,
                $analysisNotes
            );

            // Log activity
            ActivityLog::log('duplication_analysis_completed', 'duplication_cases', $case);

            // Send notification if high duplication
            if ($similarityScore >= 80) {
                app(NotificationService::class)->notifyHighDuplication($request, $case);
            }

            return $case;
        });
    }

    /**
     * Find similar technologies.
     */
    protected function findSimilarTechnologies(RequestItem $request): \Illuminate\Database\Eloquent\Collection
    {
        return Technology::query()
            ->where('category', $request->category)
            ->where('status', 'active')
            ->get()
            ->filter(function ($tech) use ($request) {
                // Calculate basic similarity
                $nameSimilarity = $this->calculateStringSimilarity($request->title, $tech->name);
                return $nameSimilarity > 0.3; // 30% threshold
            })
            ->sortByDesc(function ($tech) use ($request) {
                return $this->calculateSimilarityScore($request, $tech);
            });
    }

    /**
     * Calculate similarity score between request and technology.
     */
    protected function calculateSimilarityScore(RequestItem $request, Technology $technology): float
    {
        $scores = [];

        // Name similarity (40% weight)
        $nameSimilarity = $this->calculateStringSimilarity($request->title, $technology->name);
        $scores['name'] = $nameSimilarity * 0.4;

        // Category match (30% weight)
        $categoryMatch = $request->category === $technology->category ? 1 : 0;
        $scores['category'] = $categoryMatch * 0.3;

        // Office/Owner match (20% weight)
        $officeMatch = $request->office === $technology->owner_office ? 1 : 0;
        $scores['office'] = $officeMatch * 0.2;

        // Description similarity (10% weight)
        if ($request->description && $technology->classification) {
            $descSimilarity = $this->calculateStringSimilarity($request->description, $technology->classification);
            $scores['description'] = $descSimilarity * 0.1;
        } else {
            $scores['description'] = 0;
        }

        $totalScore = array_sum($scores);

        return round($totalScore * 100, 2); // Convert to percentage
    }

    /**
     * Calculate string similarity using Levenshtein distance.
     */
    protected function calculateStringSimilarity(string $str1, string $str2): float
    {
        $str1 = strtolower(trim($str1));
        $str2 = strtolower(trim($str2));

        if ($str1 === $str2) {
            return 1.0;
        }

        $maxLen = max(strlen($str1), strlen($str2));
        if ($maxLen === 0) {
            return 0.0;
        }

        $distance = levenshtein($str1, $str2);
        return 1 - ($distance / $maxLen);
    }

    /**
     * Determine recommendation based on similarity score.
     */
    protected function determineRecommendation(float $similarityScore): string
    {
        if ($similarityScore >= 80) {
            return 'reuse'; // High similarity - recommend reusing existing
        } elseif ($similarityScore >= 50) {
            return 'extend'; // Medium similarity - recommend extending existing
        } else {
            return 'new'; // Low similarity - proceed as new
        }
    }

    /**
     * Generate analysis notes.
     */
    protected function generateAnalysisNotes(RequestItem $request, Technology $technology, float $score): string
    {
        $notes = "Similarity Analysis:\n\n";
        $notes .= "Request: {$request->title}\n";
        $notes .= "Similar Technology: {$technology->name}\n";
        $notes .= "Similarity Score: {$score}%\n\n";

        if ($score >= 80) {
            $notes .= "HIGH DUPLICATION DETECTED:\n";
            $notes .= "The requested technology is highly similar to an existing system. ";
            $notes .= "Consider reusing or leveraging the existing technology ({$technology->name}) ";
            $notes .= "deployed at {$technology->owner_office}.\n\n";
            $notes .= "Benefits of reuse:\n";
            $notes .= "- Cost savings\n";
            $notes .= "- Faster deployment\n";
            $notes .= "- Reduced maintenance overhead\n";
            $notes .= "- Standardization across offices\n";
        } elseif ($score >= 50) {
            $notes .= "MEDIUM DUPLICATION DETECTED:\n";
            $notes .= "The requested technology has moderate similarity to an existing system. ";
            $notes .= "Consider extending or customizing the existing technology ({$technology->name}) ";
            $notes .= "rather than deploying a completely new solution.\n\n";
            $notes .= "Recommended actions:\n";
            $notes .= "- Evaluate extension possibilities\n";
            $notes .= "- Assess customization requirements\n";
            $notes .= "- Compare costs: extend vs. new deployment\n";
        } else {
            $notes .= "LOW DUPLICATION:\n";
            $notes .= "The requested technology has low similarity to existing systems. ";
            $notes .= "Proceed with new deployment as planned.\n";
        }

        return $notes;
    }

    /**
     * Create duplication case record.
     */
    protected function createDuplicationCase(
        RequestItem $request,
        ?Technology $technology,
        float $score,
        string $recommendation,
        string $notes
    ): DuplicationCase {
        return DuplicationCase::create([
            'request_item_id' => $request->id,
            'existing_technology_id' => $technology?->id,
            'similarity_score' => $score,
            'recommendation' => $recommendation,
            'analysis_notes' => $notes,
            'analyzed_by' => auth()->id(),
        ]);
    }

    /**
     * Override duplication analysis (manual review).
     */
    public function overrideAnalysis(
        DuplicationCase $case,
        string $recommendation,
        string $notes,
        int $userId
    ): DuplicationCase {
        $oldValues = $case->toArray();

        $case->update([
            'recommendation' => $recommendation,
            'analysis_notes' => $notes . "\n\n[Manual Override by User ID: {$userId}]",
            'analyzed_by' => $userId,
        ]);

        ActivityLog::log('duplication_analysis_overridden', 'duplication_cases', $case, $oldValues, $case->toArray());

        return $case;
    }

    /**
     * Get duplication statistics.
     */
    public function getStatistics(): array
    {
        $total = DuplicationCase::count();
        $highDuplication = DuplicationCase::where('similarity_score', '>=', 80)->count();
        $mediumDuplication = DuplicationCase::whereBetween('similarity_score', [50, 79.99])->count();
        $lowDuplication = DuplicationCase::where('similarity_score', '<', 50)->count();

        $reuse = DuplicationCase::where('recommendation', 'reuse')->count();
        $extend = DuplicationCase::where('recommendation', 'extend')->count();
        $new = DuplicationCase::where('recommendation', 'new')->count();

        return [
            'total_analyses' => $total,
            'high_duplication' => $highDuplication,
            'medium_duplication' => $mediumDuplication,
            'low_duplication' => $lowDuplication,
            'recommendations' => [
                'reuse' => $reuse,
                'extend' => $extend,
                'new' => $new,
            ],
            'duplication_rate' => $total > 0 ? round((($highDuplication + $mediumDuplication) / $total) * 100, 2) : 0,
        ];
    }
}
