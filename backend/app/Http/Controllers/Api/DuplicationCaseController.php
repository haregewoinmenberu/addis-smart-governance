<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DuplicationCase;
use App\Models\RequestItem;
use App\Services\DuplicationAnalysisService;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DuplicationCaseController extends Controller
{
    protected $duplicationService;

    public function __construct(DuplicationAnalysisService $duplicationService)
    {
        $this->duplicationService = $duplicationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DuplicationCase::with(['requestItem', 'existingTechnology', 'analyzer'])
            ->orderByDesc('created_at');

        // Filter by recommendation
        if ($recommendation = $request->input('recommendation')) {
            $query->where('recommendation', $recommendation);
        }

        // Filter by similarity score range
        if ($request->has('min_score')) {
            $query->where('similarity_score', '>=', $request->input('min_score'));
        }
        if ($request->has('max_score')) {
            $query->where('similarity_score', '<=', $request->input('max_score'));
        }

        $data = $query->paginate($request->input('per_page', 15));

        return response()->json($data);
    }

    /**
     * Analyze a request for duplications.
     */
    public function analyze(Request $request, string $requestId)
    {
        $requestItem = RequestItem::findOrFail($requestId);

        // Check if already analyzed
        if ($requestItem->duplicationCase) {
            return response()->json([
                'message' => 'Request has already been analyzed',
                'data' => $requestItem->duplicationCase->load(['existingTechnology', 'analyzer']),
            ], 422);
        }

        $case = $this->duplicationService->analyzeRequest($requestItem);

        return response()->json([
            'message' => 'Duplication analysis completed',
            'data' => $case->load(['existingTechnology', 'analyzer']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $case = DuplicationCase::with([
            'requestItem.submittedBy',
            'existingTechnology',
            'analyzer',
        ])->findOrFail($id);

        return response()->json(['data' => $case]);
    }

    /**
     * Override duplication analysis (manual review).
     */
    public function override(Request $request, string $id)
    {
        $case = DuplicationCase::findOrFail($id);

        $data = $request->validate([
            'recommendation' => ['required', 'in:reuse,extend,new'],
            'analysis_notes' => ['required', 'string'],
        ]);

        $updatedCase = $this->duplicationService->overrideAnalysis(
            $case,
            $data['recommendation'],
            $data['analysis_notes'],
            auth()->id()
        );

        return response()->json([
            'message' => 'Duplication analysis overridden successfully',
            'data' => $updatedCase->load(['existingTechnology', 'analyzer']),
        ]);
    }

    /**
     * Get duplication statistics.
     */
    public function statistics()
    {
        $stats = $this->duplicationService->getStatistics();

        return response()->json(['data' => $stats]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $case = DuplicationCase::findOrFail($id);

        ActivityLog::log('delete', 'duplication_cases', $case, $case->toArray(), null);

        $case->delete();

        return response()->json(['message' => 'Duplication case deleted successfully']);
    }
}
