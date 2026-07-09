<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchMilestone;
use App\Models\ResearchActivityLog;
use Illuminate\Http\Request;

class ResearchMilestoneController extends Controller
{
    public function index(Request $request, ResearchProject $researchProject)
    {
        $milestones = $researchProject->milestones()
            ->with('assignedTo')
            ->orderBy('target_date')
            ->get();

        return response()->json($milestones);
    }

    public function store(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_date' => 'required|date',
            'completion_criteria' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $validated['research_project_id'] = $researchProject->id;
        $validated['status'] = 'pending';

        $milestone = ResearchMilestone::create($validated);

        ResearchActivityLog::log('created', $milestone, null, $validated, 'Milestone created');

        return response()->json($milestone->load('assignedTo'), 201);
    }

    public function show(ResearchProject $researchProject, ResearchMilestone $milestone)
    {
        return response()->json($milestone->load(['assignedTo', 'tasks']));
    }

    public function update(Request $request, ResearchProject $researchProject, ResearchMilestone $milestone)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'target_date' => 'sometimes|date',
            'completion_criteria' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'sometimes|string',
            'actual_completion_date' => 'nullable|date',
        ]);

        $oldValues = $milestone->toArray();
        $milestone->update($validated);

        // Update project progress
        $this->updateProjectProgress($researchProject);

        ResearchActivityLog::log('updated', $milestone, $oldValues, $validated, 'Milestone updated');

        return response()->json($milestone->load('assignedTo'));
    }

    public function destroy(ResearchProject $researchProject, ResearchMilestone $milestone)
    {
        ResearchActivityLog::log('deleted', $milestone, $milestone->toArray(), null, 'Milestone deleted');
        
        $milestone->delete();

        // Update project progress
        $this->updateProjectProgress($researchProject);

        return response()->json(['message' => 'Milestone deleted successfully']);
    }

    public function complete(Request $request, ResearchProject $researchProject, ResearchMilestone $milestone)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $milestone->update([
            'status' => 'completed',
            'actual_completion_date' => now(),
            'completion_notes' => $validated['notes'] ?? null,
        ]);

        // Update project progress
        $this->updateProjectProgress($researchProject);

        ResearchActivityLog::log('completed', $milestone, null, null, 'Milestone completed');

        return response()->json($milestone);
    }

    protected function updateProjectProgress(ResearchProject $project)
    {
        $total = $project->milestones()->count();
        if ($total === 0) return;

        $completed = $project->milestones()->where('status', 'completed')->count();
        $progress = round(($completed / $total) * 100);

        $project->update(['progress_percentage' => $progress]);
    }
}
