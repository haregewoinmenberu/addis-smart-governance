<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Services\DisciplinaryManagementService;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    protected $disciplinaryService;

    public function __construct(DisciplinaryManagementService $disciplinaryService)
    {
        $this->disciplinaryService = $disciplinaryService;
    }

    /**
     * Get all complaints
     */
    public function index(Request $request)
    {
        $query = Complaint::with([
            'professional',
            'license',
            'complainant',
            'investigator'
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('violation_type')) {
            $query->where('violation_type', $request->violation_type);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('complaint_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $complaints = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($complaints);
    }

    /**
     * File new complaint
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'professional_id' => 'required|exists:users,id',
            'license_id' => 'nullable|exists:licenses,id',
            'complainant_name' => 'required_without:is_anonymous|string',
            'complainant_email' => 'required_without:is_anonymous|email',
            'complainant_phone' => 'nullable|string',
            'is_anonymous' => 'boolean',
            'violation_type' => 'required|string',
            'severity' => 'required|in:low,medium,high,critical',
            'description' => 'required|string',
            'incident_date' => 'nullable|date',
            'incident_location' => 'nullable|string',
            'witnesses' => 'nullable|array',
            'evidence_files' => 'nullable|array',
        ]);

        try {
            $complaint = $this->disciplinaryService->fileComplaint(
                $validated,
                $request->user() ? $request->user()->id : null
            );

            return response()->json([
                'message' => 'Complaint filed successfully',
                'complaint' => $complaint->load(['professional', 'license']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to file complaint: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get single complaint
     */
    public function show($id)
    {
        $complaint = Complaint::with([
            'professional',
            'license',
            'complainant',
            'investigator',
            'disciplinaryCase',
            'workflowHistory.user'
        ])->findOrFail($id);

        return response()->json($complaint);
    }

    /**
     * Assign investigator
     */
    public function assignInvestigator(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'investigator_id' => 'required|exists:users,id',
        ]);

        $success = $this->disciplinaryService->assignInvestigator(
            $complaint,
            $validated['investigator_id'],
            auth()->id()
        );

        if (!$success) {
            return response()->json(['error' => 'Failed to assign investigator'], 422);
        }

        return response()->json([
            'message' => 'Investigator assigned successfully',
            'complaint' => $complaint->fresh(['investigator']),
        ]);
    }

    /**
     * Complete investigation
     */
    public function completeInvestigation(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'summary' => 'required|string',
            'findings' => 'required|array',
            'evidence' => 'required|array',
        ]);

        try {
            $case = $this->disciplinaryService->completeInvestigation(
                $complaint,
                $validated['summary'],
                $validated['findings'],
                $validated['evidence'],
                auth()->id()
            );

            return response()->json([
                'message' => 'Investigation completed successfully',
                'complaint' => $complaint->fresh(),
                'case' => $case,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to complete investigation'], 500);
        }
    }

    /**
     * Dismiss complaint
     */
    public function dismiss(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $success = $this->disciplinaryService->dismissComplaint(
            $complaint,
            $validated['reason'],
            auth()->id()
        );

        return response()->json([
            'message' => 'Complaint dismissed',
            'complaint' => $complaint->fresh(),
        ]);
    }

    /**
     * Get complaint statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => Complaint::count(),
            'by_status' => [],
            'by_violation_type' => [],
            'by_severity' => [
                'low' => Complaint::where('severity', 'low')->count(),
                'medium' => Complaint::where('severity', 'medium')->count(),
                'high' => Complaint::where('severity', 'high')->count(),
                'critical' => Complaint::where('severity', 'critical')->count(),
            ],
            'recent' => Complaint::latest()->take(5)->get(),
        ];

        return response()->json($stats);
    }
}
