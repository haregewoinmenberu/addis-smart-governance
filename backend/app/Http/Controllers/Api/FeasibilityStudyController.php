<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeasibilityStudy;
use App\Models\RequestItem;
use App\Services\FeasibilityEvaluationService;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class FeasibilityStudyController extends Controller
{
    protected $feasibilityService;

    public function __construct(FeasibilityEvaluationService $feasibilityService)
    {
        $this->feasibilityService = $feasibilityService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FeasibilityStudy::with(['requestItem', 'evaluator'])
            ->orderByDesc('evaluated_at');

        // Filter by risk level
        if ($riskLevel = $request->input('risk_level')) {
            switch ($riskLevel) {
                case 'low':
                    $query->where('overall_risk_score', '>=', 80);
                    break;
                case 'medium':
                    $query->whereBetween('overall_risk_score', [50, 79.99]);
                    break;
                case 'high':
                    $query->where('overall_risk_score', '<', 50);
                    break;
            }
        }

        $data = $query->paginate($request->input('per_page', 15));

        return response()->json($data);
    }

    /**
     * Evaluate a request.
     */
    public function evaluate(Request $request, string $requestId)
    {
        $requestItem = RequestItem::findOrFail($requestId);

        // Check if already evaluated
        if ($requestItem->feasibilityStudy) {
            return response()->json([
                'message' => 'Request has already been evaluated',
                'data' => $requestItem->feasibilityStudy->load('evaluator'),
            ], 422);
        }

        $data = $request->validate([
            'technical_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'financial_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'security_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'infrastructure_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'integration_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'sustainability_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'recommendation' => ['nullable', 'string'],
        ]);

        $scores = [
            'technical' => $data['technical_score'],
            'financial' => $data['financial_score'],
            'security' => $data['security_score'],
            'infrastructure' => $data['infrastructure_score'],
            'integration' => $data['integration_score'],
            'sustainability' => $data['sustainability_score'],
        ];

        $study = $this->feasibilityService->evaluateRequest(
            $requestItem,
            $scores,
            $data['recommendation'] ?? null,
            auth()->id()
        );

        return response()->json([
            'message' => 'Feasibility evaluation completed',
            'data' => $study->load('evaluator'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $study = FeasibilityStudy::with([
            'requestItem.submittedBy',
            'evaluator',
        ])->findOrFail($id);

        return response()->json(['data' => $study]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $study = FeasibilityStudy::findOrFail($id);

        $data = $request->validate([
            'technical_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'financial_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'security_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'infrastructure_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'integration_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'sustainability_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'recommendation' => ['nullable', 'string'],
        ]);

        $scores = [
            'technical' => $data['technical_score'] ?? $study->technical_score,
            'financial' => $data['financial_score'] ?? $study->financial_score,
            'security' => $data['security_score'] ?? $study->security_score,
            'infrastructure' => $data['infrastructure_score'] ?? $study->infrastructure_score,
            'integration' => $data['integration_score'] ?? $study->integration_score,
            'sustainability' => $data['sustainability_score'] ?? $study->sustainability_score,
        ];

        $updatedStudy = $this->feasibilityService->updateEvaluation(
            $study,
            $scores,
            $data['recommendation'] ?? null,
            auth()->id()
        );

        return response()->json([
            'message' => 'Feasibility study updated successfully',
            'data' => $updatedStudy->load('evaluator'),
        ]);
    }

    /**
     * Get evaluation criteria template.
     */
    public function criteria()
    {
        $criteria = $this->feasibilityService->getEvaluationCriteria();

        return response()->json(['data' => $criteria]);
    }

    /**
     * Get feasibility statistics.
     */
    public function statistics()
    {
        $stats = $this->feasibilityService->getStatistics();

        return response()->json(['data' => $stats]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $study = FeasibilityStudy::findOrFail($id);

        ActivityLog::log('delete', 'feasibility_studies', $study, $study->toArray(), null);

        $study->delete();

        return response()->json(['message' => 'Feasibility study deleted successfully']);
    }
}
