<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TechnologyEvaluation;
use App\Models\TechnologyRequest;
use App\Models\TechnologyAuditLog;
use Illuminate\Http\Request;

class TechnologyEvaluationController extends Controller
{
    public function index(Request $request)
    {
        $query = TechnologyEvaluation::with(['technologyRequest', 'evaluator']);

        if ($request->evaluator_id) {
            $query->where('evaluator_id', $request->evaluator_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->evaluation_type) {
            $query->where('evaluation_type', $request->evaluation_type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'technology_request_id' => 'required|exists:technology_requests,id',
            'evaluation_type' => 'required|string',
            'score' => 'required|integer|min:0|max:100',
            'risk_level' => 'required|string',
            'findings' => 'required|string',
            'recommendations' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        $validated['evaluator_id'] = auth()->id();
        $validated['status'] = 'completed';
        $validated['completed_at'] = now();

        $evaluation = TechnologyEvaluation::create($validated);

        TechnologyAuditLog::log('evaluated', $evaluation, null, $validated);

        return response()->json($evaluation->load('evaluator'), 201);
    }

    public function show(TechnologyEvaluation $technologyEvaluation)
    {
        return response()->json($technologyEvaluation->load(['technologyRequest', 'evaluator', 'checklists']));
    }

    public function update(Request $request, TechnologyEvaluation $technologyEvaluation)
    {
        $validated = $request->validate([
            'score' => 'sometimes|integer|min:0|max:100',
            'risk_level' => 'sometimes|string',
            'findings' => 'sometimes|string',
            'recommendations' => 'nullable|string',
        ]);

        $oldValues = $technologyEvaluation->toArray();
        $technologyEvaluation->update($validated);

        TechnologyAuditLog::log('updated', $technologyEvaluation, $oldValues, $validated);

        return response()->json($technologyEvaluation);
    }

    public function start(TechnologyEvaluation $technologyEvaluation)
    {
        $technologyEvaluation->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json($technologyEvaluation);
    }

    public function complete(Request $request, TechnologyEvaluation $technologyEvaluation)
    {
        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'risk_level' => 'required|string',
            'findings' => 'required|string',
        ]);

        $technologyEvaluation->update([
            ...$validated,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json($technologyEvaluation);
    }

    public function myEvaluations(Request $request)
    {
        $evaluations = TechnologyEvaluation::where('evaluator_id', auth()->id())
            ->with('technologyRequest')
            ->latest()
            ->paginate(20);

        return response()->json($evaluations);
    }
}
