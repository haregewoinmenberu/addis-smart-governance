<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DisciplinaryCase;
use App\Models\Hearing;
use App\Models\DisciplinaryAction;
use App\Services\DisciplinaryManagementService;
use Illuminate\Http\Request;

class DisciplinaryCaseController extends Controller
{
    protected $disciplinaryService;

    public function __construct(DisciplinaryManagementService $disciplinaryService)
    {
        $this->disciplinaryService = $disciplinaryService;
    }

    /**
     * Get all cases
     */
    public function index(Request $request)
    {
        $query = DisciplinaryCase::with([
            'complaint',
            'professional',
            'license',
            'leadInvestigator'
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('case_type')) {
            $query->where('case_type', $request->case_type);
        }

        if ($request->has('is_resolved')) {
            $query->where('is_resolved', $request->boolean('is_resolved'));
        }

        $cases = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($cases);
    }

    /**
     * Get single case
     */
    public function show($id)
    {
        $case = DisciplinaryCase::with([
            'complaint',
            'professional',
            'license',
            'leadInvestigator',
            'hearings',
            'disciplinaryActions.imposer',
            'workflowHistory.user'
        ])->findOrFail($id);

        return response()->json($case);
    }

    /**
     * Schedule hearing
     */
    public function scheduleHearing(Request $request, $id)
    {
        $case = DisciplinaryCase::findOrFail($id);

        $validated = $request->validate([
            'hearing_type' => 'required|in:preliminary,formal,appeal',
            'scheduled_at' => 'required|date|after:now',
            'location' => 'nullable|string',
            'meeting_link' => 'nullable|url',
            'duration_minutes' => 'nullable|integer|min:30',
            'committee_members' => 'required|array',
        ]);

        try {
            $hearing = $this->disciplinaryService->scheduleHearing(
                $case,
                $validated,
                auth()->id()
            );

            return response()->json([
                'message' => 'Hearing scheduled successfully',
                'hearing' => $hearing,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to schedule hearing'], 500);
        }
    }

    /**
     * Record hearing decision
     */
    public function recordHearingDecision(Request $request, $hearingId)
    {
        $hearing = Hearing::findOrFail($hearingId);

        $validated = $request->validate([
            'decision' => 'required|string',
            'recommendations' => 'required|array',
            'minutes' => 'nullable|string',
        ]);

        if (isset($validated['minutes'])) {
            $hearing->update(['minutes' => $validated['minutes']]);
        }

        $success = $this->disciplinaryService->recordHearingDecision(
            $hearing,
            $validated['decision'],
            $validated['recommendations'],
            auth()->id()
        );

        return response()->json([
            'message' => 'Hearing decision recorded successfully',
            'hearing' => $hearing->fresh(),
        ]);
    }

    /**
     * Impose disciplinary action
     */
    public function imposeDisciplinaryAction(Request $request, $id)
    {
        $case = DisciplinaryCase::findOrFail($id);

        $validated = $request->validate([
            'action_type' => 'required|string',
            'action_description' => 'required|string',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'is_permanent' => 'boolean',
            'fine_amount' => 'nullable|numeric|min:0',
            'training_course' => 'nullable|string',
            'training_hours' => 'nullable|integer|min:1',
            'practice_restrictions' => 'nullable|string',
            'suspension_terms' => 'nullable|string',
        ]);

        try {
            $action = $this->disciplinaryService->imposeDisciplinaryAction(
                $case,
                $validated,
                auth()->id()
            );

            return response()->json([
                'message' => 'Disciplinary action imposed successfully',
                'action' => $action->load(['professional', 'license']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to impose action: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get case statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => DisciplinaryCase::count(),
            'active' => DisciplinaryCase::where('is_resolved', false)->count(),
            'resolved' => DisciplinaryCase::where('is_resolved', true)->count(),
            'by_status' => [],
            'by_type' => [
                'complaint_based' => DisciplinaryCase::where('case_type', 'complaint_based')->count(),
                'audit_based' => DisciplinaryCase::where('case_type', 'audit_based')->count(),
                'inspection_based' => DisciplinaryCase::where('case_type', 'inspection_based')->count(),
            ],
        ];

        return response()->json($stats);
    }
}
