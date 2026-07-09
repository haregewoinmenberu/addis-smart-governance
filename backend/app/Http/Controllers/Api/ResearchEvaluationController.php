<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchEvaluation;
use App\Models\ResearchActivityLog;
use Illuminate\Http\Request;

class ResearchEvaluationController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchEvaluation::with(['researchProject', 'evaluator']);

        if ($request->trl_level) {
            $query->where('trl_level', $request->trl_level);
        }

        if ($request->search) {
            $query->whereHas('researchProject', function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('project_code', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'benchmark_baseline' => 'required|numeric|min:0|max:100',
            'performance_improvement' => 'required|numeric',
            'research_findings' => 'required|string',
            'recommendations' => 'required|string',
            'lessons_learned' => 'required|string',
            'trl_level' => 'required|integer|min:1|max:9',
            'trl_justification' => 'required|string',
            'evaluation_date' => 'required|date',
        ]);

        $validated['evaluated_by'] = auth()->id();

        $evaluation = ResearchEvaluation::create($validated);

        // Update project TRL level
        $project = ResearchProject::find($validated['research_project_id']);
        $project->update(['trl_level' => $validated['trl_level']]);

        ResearchActivityLog::log('evaluated', $project, null, $validated, 'Research project evaluated');

        return response()->json($evaluation->load(['researchProject', 'evaluator']), 201);
    }

    public function show(ResearchEvaluation $researchEvaluation)
    {
        return response()->json($researchEvaluation->load([
            'researchProject.projectLead',
            'evaluator',
            'trlAssessments'
        ]));
    }

    public function update(Request $request, ResearchEvaluation $researchEvaluation)
    {
        $validated = $request->validate([
            'benchmark_baseline' => 'sometimes|numeric|min:0|max:100',
            'performance_improvement' => 'sometimes|numeric',
            'research_findings' => 'sometimes|string',
            'recommendations' => 'sometimes|string',
            'lessons_learned' => 'sometimes|string',
            'trl_level' => 'sometimes|integer|min:1|max:9',
            'trl_justification' => 'sometimes|string',
            'evaluation_date' => 'sometimes|date',
        ]);

        $oldValues = $researchEvaluation->toArray();
        $researchEvaluation->update($validated);

        // Update project TRL if changed
        if (isset($validated['trl_level'])) {
            $researchEvaluation->researchProject->update(['trl_level' => $validated['trl_level']]);
        }

        ResearchActivityLog::log('updated', $researchEvaluation, $oldValues, $validated, 'Evaluation updated');

        return response()->json($researchEvaluation->load(['researchProject', 'evaluator']));
    }

    public function destroy(ResearchEvaluation $researchEvaluation)
    {
        ResearchActivityLog::log('deleted', $researchEvaluation, $researchEvaluation->toArray(), null, 'Evaluation deleted');
        
        $researchEvaluation->delete();

        return response()->json(['message' => 'Evaluation deleted successfully']);
    }

    public function byProject(ResearchProject $researchProject)
    {
        $evaluations = $researchProject->evaluations()
            ->with('evaluator')
            ->latest()
            ->get();

        return response()->json($evaluations);
    }

    public function trlDistribution()
    {
        $distribution = ResearchEvaluation::selectRaw('trl_level, count(*) as count')
            ->groupBy('trl_level')
            ->orderBy('trl_level')
            ->get()
            ->map(function($item) {
                return [
                    'level' => $item->trl_level,
                    'label' => "TRL {$item->trl_level}",
                    'count' => $item->count,
                    'description' => $this->getTRLDescription($item->trl_level)
                ];
            });

        return response()->json($distribution);
    }

    protected function getTRLDescription($level)
    {
        $descriptions = [
            1 => 'Basic principles observed',
            2 => 'Technology concept formulated',
            3 => 'Experimental proof of concept',
            4 => 'Technology validated in lab',
            5 => 'Technology validated in relevant environment',
            6 => 'Technology demonstrated in relevant environment',
            7 => 'System prototype demonstration in operational environment',
            8 => 'System complete and qualified',
            9 => 'Actual system proven in operational environment',
        ];

        return $descriptions[$level] ?? 'Unknown';
    }
}
