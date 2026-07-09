<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchMilestone;
use App\Models\ResearchTask;
use App\Models\ResearchActivityLog;
use Illuminate\Http\Request;

class ResearchTaskController extends Controller
{
    public function index(Request $request, ResearchProject $researchProject)
    {
        $query = $researchProject->tasks()->with(['milestone', 'assignedToUser']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->milestone_id) {
            $query->where('milestone_id', $request->milestone_id);
        }

        if ($request->assigned_to) {
            $query->where('assigned_to', $request->assigned_to);
        }

        return response()->json($query->orderBy('due_date')->get());
    }

    public function store(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'milestone_id' => 'nullable|exists:research_milestones,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'required|date',
            'priority' => 'nullable|string',
        ]);

        $validated['research_project_id'] = $researchProject->id;
        $validated['status'] = 'pending';

        $task = ResearchTask::create($validated);

        ResearchActivityLog::log('created', $task, null, $validated, 'Task created');

        return response()->json($task->load(['milestone', 'assignedToUser']), 201);
    }

    public function show(ResearchProject $researchProject, ResearchTask $task)
    {
        return response()->json($task->load(['milestone', 'assignedToUser']));
    }

    public function update(Request $request, ResearchProject $researchProject, ResearchTask $task)
    {
        $validated = $request->validate([
            'milestone_id' => 'nullable|exists:research_milestones,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'sometimes|date',
            'priority' => 'nullable|string',
            'status' => 'sometimes|string',
        ]);

        $oldValues = $task->toArray();
        $task->update($validated);

        ResearchActivityLog::log('updated', $task, $oldValues, $validated, 'Task updated');

        return response()->json($task->load(['milestone', 'assignedToUser']));
    }

    public function destroy(ResearchProject $researchProject, ResearchTask $task)
    {
        ResearchActivityLog::log('deleted', $task, $task->toArray(), null, 'Task deleted');
        
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function complete(Request $request, ResearchProject $researchProject, ResearchTask $task)
    {
        $validated = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completion_notes' => $validated['completion_notes'] ?? null,
        ]);

        ResearchActivityLog::log('completed', $task, null, null, 'Task completed');

        return response()->json($task);
    }

    public function myTasks(Request $request)
    {
        $tasks = ResearchTask::where('assigned_to', auth()->id())
            ->with(['researchProject', 'milestone'])
            ->orderBy('due_date')
            ->get();

        return response()->json($tasks);
    }
}
