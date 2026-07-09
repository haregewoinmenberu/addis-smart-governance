<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchTeamMember;
use App\Models\ResearchActivityLog;
use Illuminate\Http\Request;

class ResearchTeamController extends Controller
{
    public function index(Request $request, ResearchProject $researchProject)
    {
        $members = $researchProject->teamMembers()
            ->with('user')
            ->where('is_active', true)
            ->get();

        return response()->json($members);
    }

    public function store(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string',
            'responsibilities' => 'nullable|string',
            'joined_at' => 'nullable|date',
        ]);

        // Check if user is already a member
        $existing = $researchProject->teamMembers()
            ->where('user_id', $validated['user_id'])
            ->where('is_active', true)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'User is already a team member'], 422);
        }

        $validated['research_project_id'] = $researchProject->id;
        $validated['is_active'] = true;
        $validated['joined_at'] = $validated['joined_at'] ?? now();

        $member = ResearchTeamMember::create($validated);

        ResearchActivityLog::log('created', $member, null, $validated, 'Team member added');

        return response()->json($member->load('user'), 201);
    }

    public function show(ResearchProject $researchProject, ResearchTeamMember $member)
    {
        return response()->json($member->load('user'));
    }

    public function update(Request $request, ResearchProject $researchProject, ResearchTeamMember $member)
    {
        $validated = $request->validate([
            'role' => 'sometimes|string',
            'responsibilities' => 'nullable|string',
        ]);

        $oldValues = $member->toArray();
        $member->update($validated);

        ResearchActivityLog::log('updated', $member, $oldValues, $validated, 'Team member updated');

        return response()->json($member->load('user'));
    }

    public function destroy(ResearchProject $researchProject, ResearchTeamMember $member)
    {
        $member->update([
            'is_active' => false,
            'left_at' => now(),
        ]);

        ResearchActivityLog::log('deleted', $member, null, null, 'Team member removed');

        return response()->json(['message' => 'Team member removed successfully']);
    }

    public function restore(Request $request, ResearchProject $researchProject, ResearchTeamMember $member)
    {
        $member->update([
            'is_active' => true,
            'left_at' => null,
        ]);

        return response()->json($member->load('user'));
    }
}
