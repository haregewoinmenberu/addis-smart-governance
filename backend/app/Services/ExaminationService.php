<?php

namespace App\Services;

use App\Models\Examination;
use App\Models\ExamAttempt;
use App\Models\LicenseApplication;
use App\Enums\ExamResult;
use Illuminate\Support\Facades\DB;

class ExaminationService
{
    /**
     * Register candidate for examination
     */
    public function registerCandidate(
        Examination $examination,
        LicenseApplication $application,
        $candidateId
    ): ExamAttempt {
        // Check available seats
        if ($examination->getAvailableSeats() === 0) {
            throw new \Exception('No available seats for this examination');
        }

        // Get attempt number
        $attemptNumber = ExamAttempt::where('candidate_id', $candidateId)
            ->where('examination_id', $examination->id)
            ->count() + 1;

        return ExamAttempt::create([
            'examination_id' => $examination->id,
            'application_id' => $application->id,
            'candidate_id' => $candidateId,
            'attempt_number' => $attemptNumber,
            'total_marks' => $examination->total_marks,
            'passing_marks' => $examination->passing_marks,
        ]);
    }

    /**
     * Start exam attempt
     */
    public function startExam(ExamAttempt $attempt): bool
    {
        if ($attempt->started_at) {
            throw new \Exception('Exam already started');
        }

        return $attempt->update(['started_at' => now()]);
    }

    /**
     * Submit exam attempt
     */
    public function submitExam(ExamAttempt $attempt): bool
    {
        if (!$attempt->started_at) {
            throw new \Exception('Exam not started');
        }

        if ($attempt->submitted_at) {
            throw new \Exception('Exam already submitted');
        }

        return $attempt->update(['submitted_at' => now()]);
    }

    /**
     * Evaluate exam attempt
     */
    public function evaluateExam(
        ExamAttempt $attempt,
        int $score,
        $evaluatorId,
        ?string $comments = null
    ): bool {
        DB::beginTransaction();
        try {
            $attempt->update([
                'score' => $score,
                'evaluator_id' => $evaluatorId,
                'evaluator_comments' => $comments,
                'evaluated_at' => now(),
            ]);

            // Calculate result
            $attempt->calculateResult();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * File appeal for exam result
     */
    public function fileAppeal(ExamAttempt $attempt, string $reason): bool
    {
        if (!$attempt->result) {
            throw new \Exception('Cannot appeal before exam is evaluated');
        }

        if ($attempt->result === ExamResult::PASS) {
            throw new \Exception('Cannot appeal passed exam');
        }

        return $attempt->update([
            'is_appeal' => true,
            'appeal_reason' => $reason,
            'result' => ExamResult::APPEAL,
        ]);
    }

    /**
     * Get exam statistics
     */
    public function getExamStatistics(Examination $examination): array
    {
        $attempts = $examination->attempts()->whereNotNull('result');

        return [
            'total_candidates' => $examination->attempts()->distinct('candidate_id')->count(),
            'total_attempts' => $attempts->count(),
            'passed' => $attempts->where('result', ExamResult::PASS)->count(),
            'failed' => $attempts->where('result', ExamResult::FAIL)->count(),
            'appeals' => $attempts->where('result', ExamResult::APPEAL)->count(),
            'pass_rate' => $examination->getPassPercentage(),
            'average_score' => $attempts->avg('score'),
            'highest_score' => $attempts->max('score'),
            'lowest_score' => $attempts->min('score'),
        ];
    }

    /**
     * Check if candidate passed exam
     */
    public function hasCandidatePassedExam(LicenseApplication $application): bool
    {
        return $application->examAttempts()
            ->where('result', ExamResult::PASS)
            ->exists();
    }
}
