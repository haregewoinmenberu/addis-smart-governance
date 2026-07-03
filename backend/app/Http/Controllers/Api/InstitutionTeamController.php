<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstitutionTeamMember;
use App\Models\Institution;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class InstitutionTeamController extends Controller
{
    /**
     * Get all team members for an institution.
     */
    public function index(Request $request, $institutionId)
    {
        $user = $request->user();
        
        // Check if user belongs to this institution
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to institution team',
            ], 403);
        }

        $query = InstitutionTeamMember::where('institution_id', $institutionId)
            ->with('user:id,name,email,phone');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by role
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $members = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $members,
        ]);
    }

    /**
     * Invite a new team member.
     */
    public function store(Request $request, $institutionId)
    {
        $user = $request->user();
        
        // Check if user belongs to this institution
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:institution_team_members,email'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', Rule::in(['admin', 'manager', 'viewer', 'collaborator'])],
        ]);

        $institution = Institution::findOrFail($institutionId);

        // Check if user already exists
        $existingUser = User::where('email', $validated['email'])->first();

        $member = InstitutionTeamMember::create([
            'institution_id' => $institutionId,
            'user_id' => $existingUser?->id,
            'email' => $validated['email'],
            'name' => $validated['name'],
            'role' => $validated['role'],
            'status' => $existingUser ? 'active' : 'invited',
            'invited_at' => now(),
            'joined_at' => $existingUser ? now() : null,
        ]);

        if (!$existingUser) {
            $token = $member->generateInvitationToken();
            
            // TODO: Send invitation email
            // Mail::to($member->email)->send(new TeamInvitation($member, $token, $institution));
        }

        $member->load('user:id,name,email,phone');

        return response()->json([
            'success' => true,
            'message' => $existingUser 
                ? 'Team member added successfully' 
                : 'Invitation sent successfully',
            'data' => $member,
        ], 201);
    }

    /**
     * Get a single team member.
     */
    public function show(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $member = InstitutionTeamMember::where('institution_id', $institutionId)
            ->with('user:id,name,email,phone')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $member,
        ]);
    }

    /**
     * Update team member role.
     */
    public function update(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $member = InstitutionTeamMember::where('institution_id', $institutionId)
            ->findOrFail($id);

        $validated = $request->validate([
            'role' => ['sometimes', Rule::in(['admin', 'manager', 'viewer', 'collaborator'])],
            'status' => ['sometimes', Rule::in(['active', 'invited', 'suspended'])],
        ]);

        $member->update($validated);
        $member->load('user:id,name,email,phone');

        return response()->json([
            'success' => true,
            'message' => 'Team member updated successfully',
            'data' => $member,
        ]);
    }

    /**
     * Remove team member.
     */
    public function destroy(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $member = InstitutionTeamMember::where('institution_id', $institutionId)
            ->findOrFail($id);

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Team member removed successfully',
        ]);
    }

    /**
     * Resend invitation.
     */
    public function resendInvitation(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $member = InstitutionTeamMember::where('institution_id', $institutionId)
            ->where('status', 'invited')
            ->findOrFail($id);

        $institution = Institution::findOrFail($institutionId);
        $token = $member->generateInvitationToken();
        
        // TODO: Send invitation email
        // Mail::to($member->email)->send(new TeamInvitation($member, $token, $institution));

        return response()->json([
            'success' => true,
            'message' => 'Invitation resent successfully',
        ]);
    }

    /**
     * Accept invitation.
     */
    public function acceptInvitation(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $hashedToken = hash('sha256', $validated['token']);
        
        $member = InstitutionTeamMember::where('invitation_token', $hashedToken)
            ->where('status', 'invited')
            ->firstOrFail();

        $user = $request->user();
        
        if ($user->email !== $member->email) {
            return response()->json([
                'success' => false,
                'message' => 'This invitation is for a different email address',
            ], 403);
        }

        $member->acceptInvitation($user);

        return response()->json([
            'success' => true,
            'message' => 'Invitation accepted successfully',
            'data' => $member,
        ]);
    }

    /**
     * Get team statistics.
     */
    public function statistics(Request $request, $institutionId)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $totalMembers = InstitutionTeamMember::where('institution_id', $institutionId)->count();
        $activeMembers = InstitutionTeamMember::where('institution_id', $institutionId)
            ->where('status', 'active')
            ->count();
        $invitedMembers = InstitutionTeamMember::where('institution_id', $institutionId)
            ->where('status', 'invited')
            ->count();
        
        $byRole = InstitutionTeamMember::where('institution_id', $institutionId)
            ->where('status', 'active')
            ->selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role');

        return response()->json([
            'success' => true,
            'data' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'invited_members' => $invitedMembers,
                'by_role' => $byRole,
            ],
        ]);
    }
}
