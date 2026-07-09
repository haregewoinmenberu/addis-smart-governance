<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchScreening;
use App\Models\ResearchActivityLog;
use App\Enums\IdeaStatus;
use App\Enums\ApprovalDecision;
use Illuminate\Http\Request;

class ResearchScreeningController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchScreening::with(['researchIdea', 'evaluator']);

        if ($request->decision) {
            $query->where('decision', $request->decision);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_idea_id' => 'required|exists:research_ideas,id',
            'strategic_alignment_score' => 'required|integer|min:0|max:10',
            'strategic_alignment_comment' => 'nullable|string',
            'feasibility_score' => 'required|integer|min:0|max:10',
            'feasibility_comment' => 'nullable|string',
            'governance_impact_score' => 'required|integer|min:0|max:10',
            'governance_impact_comment' => 'nullable|string',
            'resource_requirement_score' => 'required|integer|min:0|max:10',
            'resource_requirement_comment' => 'nullable|string',
            'innovation_level_score' => 'required|integer|min:0|max:10',
            'innovation_level_comment' => 'nullable|string',
            'risk_level_score' => 'required|integer|min:0|max:10',
            'risk_level_comment' => 'nullable|string',
            'decision' => 'required|string',
            'overall_comment' => 'nullable|string',
        ]);

        $validated['evaluated_by'] = auth()->id();

        $screening = ResearchScreening::create($validated);
        
        $researchIdea = ResearchIdea::find($validated['research_idea_id']);

        if ($screening->decision === ApprovalDecision::APPROVED) {
            $researchIdea->update([
                'status' => IdeaStatus::APPROVED,
                'priority' => $screening->calculated_priority,
            ]);
        } elseif ($screening->decision === ApprovalDecision::REJECTED) {
            $researchIdea->update(['status' => IdeaStatus::REJECTED]);
        }

        ResearchActivityLog::log('screened', $researchIdea, null, $validated, "Research idea screened: {$screening->decision}");

        return response()->json($screening->load(['researchIdea', 'evaluator']), 201);
    }

    public function show(ResearchScreening $researchScreening)
    {
        return response()->json($researchScreening->load(['researchIdea', 'evaluator']));
    }

    public function update(Request $request, ResearchScreening $researchScreening)
    {
        $validated = $request->validate([
            'strategic_alignment_score' => 'sometimes|integer|min:0|max:10',
            'strategic_alignment_comment' => 'nullable|string',
            'feasibility_score' => 'sometimes|integer|min:0|max:10',
            'feasibility_comment' => 'nullable|string',
            'governance_impact_score' => 'sometimes|integer|min:0|max:10',
            'governance_impact_comment' => 'nullable|string',
            'resource_requirement_score' => 'sometimes|integer|min:0|max:10',
            'resource_requirement_comment' => 'nullable|string',
            'innovation_level_score' => 'sometimes|integer|min:0|max:10',
            'innovation_level_comment' => 'nullable|string',
            'risk_level_score' => 'sometimes|integer|min:0|max:10',
            'risk_level_comment' => 'nullable|string',
            'decision' => 'sometimes|string',
            'overall_comment' => 'nullable|string',
        ]);

        $researchScreening->update($validated);

        return response()->json($researchScreening->load(['researchIdea', 'evaluator']));
    }
}
