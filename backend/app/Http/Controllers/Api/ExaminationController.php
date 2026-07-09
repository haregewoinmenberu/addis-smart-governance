<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examination;
use App\Models\ExamAttempt;
use App\Models\LicenseApplication;
use App\Services\ExaminationService;
use Illuminate\Http\Request;

class ExaminationController extends Controller
{
    protected $examinationService;

    public function __construct(ExaminationService $examinationService)
    {
        $this->examinationService = $examinationService;
    }

    /**
     * Get all examinations
     */
    public function index(Request $request)
    {
        $query = Examination::with(['profession', 'supervisor']);

        if ($request->has('profession_id')) {
            $query->where('profession_id', $request->profession_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('upcoming')) {
            $query->where('exam_date', '>=', now());
        }

        $examinations = $query->latest('exam_date')->paginate($request->per_page ?? 15);

        return response()->json($examinations);
    }

    /**
     * Create examination
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_code' => 'required|string|unique:examinations,exam_code',
            'profession_id' => 'required|exists:professions,id',
            'exam_title' => 'required|string',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:30',
            'total_marks' => 'required|integer|min:1',
            'passing_marks' => 'required|integer|min:1',
            'exam_date' => 'required|date',
            'start_time' => 'required',
            'exam_center' => 'nullable|string',
            'exam_location' => 'nullable|string',
            'supervisor_id' => 'nullable|exists:users,id',
            'max_candidates' => 'nullable|integer|min:1',
        ]);

        $examination = Examination::create($validated);

        return response()->json([
            'message' => 'Examination created successfully',
            'examination' => $examination,
        ], 201);
    }

    /**
     * Get single examination
     */
    public function show($id)
    {
        $examination = Examination::with([
            'profession',
            'supervisor',
            'questions',
            'attempts.candidate'
        ])->findOrFail($id);

        $statistics = $this->examinationService->getExamStatistics($examination);

        return response()->json([
            'examination' => $examination,
            'statistics' => $statistics,
            'available_seats' => $examination->getAvailableSeats(),
        ]);
    }

    /**
     * Register for examination
     */
    public function register(Request $request, $id)
    {
        $examination = Examination::findOrFail($id);

        $validated = $request->validate([
            'application_id' => 'required|exists:license_applications,id',
        ]);

        $application = LicenseApplication::findOrFail($validated['application_id']);

        try {
            $attempt = $this->examinationService->registerCandidate(
                $examination,
                $application,
                auth()->id()
            );

            return response()->json([
                'message' => 'Registered for examination successfully',
                'attempt' => $attempt,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Start exam
     */
    public function startExam($attemptId)
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        try {
            $this->examinationService->startExam($attempt);

            return response()->json([
                'message' => 'Exam started',
                'attempt' => $attempt->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Submit exam
     */
    public function submitExam($attemptId)
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        try {
            $this->examinationService->submitExam($attempt);

            return response()->json([
                'message' => 'Exam submitted successfully',
                'attempt' => $attempt->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Evaluate exam
     */
    public function evaluate(Request $request, $attemptId)
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        $validated = $request->validate([
            'score' => 'required|integer|min:0',
            'comments' => 'nullable|string',
        ]);

        try {
            $this->examinationService->evaluateExam(
                $attempt,
                $validated['score'],
                auth()->id(),
                $validated['comments'] ?? null
            );

            return response()->json([
                'message' => 'Exam evaluated successfully',
                'attempt' => $attempt->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * File appeal
     */
    public function fileAppeal(Request $request, $attemptId)
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        try {
            $this->examinationService->fileAppeal($attempt, $validated['reason']);

            return response()->json([
                'message' => 'Appeal filed successfully',
                'attempt' => $attempt->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get my exam attempts
     */
    public function myAttempts(Request $request)
    {
        $attempts = ExamAttempt::with(['examination', 'evaluator'])
            ->where('candidate_id', auth()->id())
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($attempts);
    }
}
