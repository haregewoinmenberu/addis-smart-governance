<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TechnologyRequest;
use App\Models\TechnologyAuditLog;
use App\Services\TechnologyWorkflowService;
use App\Services\TechnologyEvaluationEngine;
use App\Enums\TechnologyStage;
use Illuminate\Http\Request;

class TechnologyRequestController extends Controller
{
    public function __construct(
        protected TechnologyWorkflowService $workflowService,
        protected TechnologyEvaluationEngine $evaluationEngine
    ) {}

    public function index(Request $request)
    {
        $query = TechnologyRequest::with(['submitter', 'ownerOrganization', 'evaluations']);

        if ($request->current_stage) {
            $query->where('current_stage', $request->current_stage);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('request_number', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'type' => 'required|string',
            'description' => 'required|string',
            'purpose' => 'required|string',
            'business_problem' => 'required|string',
            'expected_benefits' => 'required|string',
            'innovation_level' => 'required|string',
            'trl_level' => 'nullable|integer|min:1|max:9',
            'owner_organization_id' => 'nullable|exists:institutions,id',
            'vendor_name' => 'nullable|string',
            'vendor_contact' => 'nullable|string',
            'contact_person' => 'required|string',
            'contact_email' => 'required|email',
            'contact_phone' => 'required|string',
            'source_type' => 'required|string',
            'research_project_id' => 'nullable|exists:research_projects,id',
            'estimated_cost' => 'nullable|numeric',
            'expected_users' => 'nullable|integer',
        ]);

        $validated['submitted_by'] = auth()->id();
        $validated['current_stage'] = TechnologyStage::SUBMISSION;
        $validated['status'] = 'draft';

        $tech = TechnologyRequest::create($validated);

        TechnologyAuditLog::log('created', $tech, null, $validated);

        return response()->json($tech->load('submitter'), 201);
    }

    public function show(TechnologyRequest $technologyRequest)
    {
        return response()->json($technologyRequest->load([
            'submitter', 'ownerOrganization', 'researchProject', 'evaluations.evaluator',
            'committeeReviews.votes', 'registry', 'documents', 'workflowHistory', 'comments'
        ]));
    }

    public function update(Request $request, TechnologyRequest $technologyRequest)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'purpose' => 'sometimes|string',
            'estimated_cost' => 'nullable|numeric',
        ]);

        $oldValues = $technologyRequest->toArray();
        $technologyRequest->update($validated);

        TechnologyAuditLog::log('updated', $technologyRequest, $oldValues, $validated);

        return response()->json($technologyRequest);
    }

    public function destroy(TechnologyRequest $technologyRequest)
    {
        TechnologyAuditLog::log('deleted', $technologyRequest, $technologyRequest->toArray(), null);
        $technologyRequest->delete();

        return response()->json(['message' => 'Technology request deleted']);
    }

    public function submit(TechnologyRequest $technologyRequest)
    {
        $technologyRequest->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->workflowService->transitionStage($technologyRequest, TechnologyStage::EVALUATION);
        $this->evaluationEngine->initiateEvaluations($technologyRequest);

        return response()->json($technologyRequest);
    }

    public function transitionStage(Request $request, TechnologyRequest $technologyRequest)
    {
        $validated = $request->validate([
            'to_stage' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $toStage = TechnologyStage::from($validated['to_stage']);
        $this->workflowService->transitionStage($technologyRequest, $toStage, $validated['reason'] ?? null);

        return response()->json(['message' => 'Stage transitioned', 'technology' => $technologyRequest->fresh()]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',

            'total_requests' => TechnologyRequest::count(),
            'by_stage' => TechnologyRequest::selectRaw('current_stage, count(*) as count')
                ->groupBy('current_stage')->get()
                ->map(fn ($row) => [
                    'stage' => $row->current_stage?->value ?? (string) $row->current_stage,
                    'label' => $row->current_stage instanceof TechnologyStage
                        ? $row->current_stage->label()
                        : (string) $row->current_stage,
                    'count' => $row->count,
                ])->values(),
            'by_category' => TechnologyRequest::selectRaw('category, count(*) as count')
                ->groupBy('category')->get()
                ->map(fn ($row) => ['category' => $row->category, 'count' => $row->count])->values(),

            'pending_evaluations' => \App\Models\TechnologyEvaluation::where('status', 'pending')->count(),
            'completed_evaluations' => \App\Models\TechnologyEvaluation::where('status', 'completed')->count(),
            'active_deployments' => \App\Models\DeploymentProject::where('status', 'active')->count(),
            'open_incidents' => \App\Models\TechnologyIncident::whereIn('status', ['reported', 'investigating'])->count(),
            'unacknowledged_alerts' => \App\Models\MonitoringAlert::where('is_acknowledged', false)->count(),

            'recent_requests' => TechnologyRequest::with('submitter')->latest()->take(5)->get(),
        ];

        // Evaluator roles: own evaluation workload
        if ($user->hasAnyRole(['security_officer', 'enterprise_architect', 'risk_officer', 'compliance_officer', 'legal_officer'])) {
            $stats['my_evaluations'] = \App\Models\TechnologyEvaluation::where('evaluator_id', $user->id)
                ->where('status', 'pending')->count();
        }

        // Governance committee: approval workload
        if ($user->hasRole('governance_committee')) {
            $stats['pending_governance'] = TechnologyRequest::where('current_stage', TechnologyStage::GOVERNANCE_DECISION)->count();
        }

        // Vendor: own submitted requests
        if ($user->hasRole('vendor')) {
            $stats['my_requests'] = TechnologyRequest::where('submitted_by', $user->id)->count();
        }

        return response()->json($stats);
    }
}
