<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFormSubmission;
use App\Models\ServiceRequestAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\RoleHierarchyService;

class ServiceRequestWorkflowController extends Controller
{
    /**
     * Get assignments for a service request
     */
    public function getAssignments(ServiceFormSubmission $serviceRequest)
    {
        $assignments = $serviceRequest->assignments()
            ->with(['assignedBy', 'assignedTo'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    /**
     * Get available team leaders for assignment
     */
    public function getAvailableTeamLeaders(Request $request)
    {
        $user = $request->user();

        // Check if user has management capabilities
        if (!RoleHierarchyService::hasUserManagementCapability($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign team leaders',
            ], 403);
        }

        // Get manageable users with team leader roles
        $teamLeaders = RoleHierarchyService::getManageableUsers($user)
            ->filter(function ($u) {
                return $u->roles->pluck('name')->contains(function ($role) {
                    return str_contains($role, 'team_leader');
                });
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $teamLeaders,
        ]);
    }

    /**
     * Get available officers for assignment
     */
    public function getAvailableOfficers(Request $request)
    {
        $user = $request->user();

        // Check if user has management capabilities
        if (!RoleHierarchyService::hasUserManagementCapability($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign officers',
            ], 403);
        }

        // Get manageable users with officer roles
        $officers = RoleHierarchyService::getManageableUsers($user)
            ->filter(function ($u) {
                return $u->roles->pluck('name')->contains(function ($role) {
                    return str_contains($role, 'officer');
                });
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $officers,
        ]);
    }

    /**
     * Assign team leader to service request
     */
    public function assignTeamLeader(Request $request, ServiceFormSubmission $serviceRequest)
    {
        $user = $request->user();

        // Check if user has management capabilities
        if (!RoleHierarchyService::hasUserManagementCapability($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign team leaders',
            ], 403);
        }

        $validated = $request->validate([
            'team_leader_id' => 'required|exists:users,id',
            'assignment_notes' => 'nullable|string',
        ]);

        // Verify the user is actually a team leader
        $teamLeader = User::find($validated['team_leader_id']);
        $hasTeamLeaderRole = $teamLeader->roles->pluck('name')->contains(function ($role) {
            return str_contains($role, 'team_leader');
        });

        if (!$hasTeamLeaderRole) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a team leader',
            ], 422);
        }

        // Verify team leader is in user's hierarchy
        $manageableUsers = RoleHierarchyService::getManageableUsers($user);
        if (!$manageableUsers->contains('id', $validated['team_leader_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign team leaders within your hierarchy',
            ], 403);
        }

        $assignment = ServiceRequestAssignment::create([
            'service_request_id' => $serviceRequest->id,
            'assigned_by' => $user->id,
            'assigned_to' => $validated['team_leader_id'],
            'assignment_type' => 'team_leader',
            'assignment_notes' => $validated['assignment_notes'] ?? null,
            'assigned_date' => now(),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Team leader assigned successfully',
            'data' => $assignment->load(['assignedBy', 'assignedTo']),
        ]);
    }

    /**
     * Assign officer to service request
     */
    public function assignOfficer(Request $request, ServiceFormSubmission $serviceRequest)
    {
        $user = $request->user();

        // Check if user has management capabilities
        if (!RoleHierarchyService::hasUserManagementCapability($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign officers',
            ], 403);
        }

        // If team leader, verify they are assigned to this service request
        $userRoles = $user->roles->pluck('name');
        $isTeamLeader = $userRoles->contains(function ($role) {
            return str_contains($role, 'team_leader');
        });

        if ($isTeamLeader) {
            $isAssignedToRequest = ServiceRequestAssignment::where('service_request_id', $serviceRequest->id)
                ->where('assigned_to', $user->id)
                ->where('assignment_type', 'team_leader')
                ->whereIn('status', ['accepted', 'in_progress'])
                ->exists();

            if (!$isAssignedToRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only assign officers to service requests assigned to you',
                ], 403);
            }
        }

        $validated = $request->validate([
            'officer_id' => 'required|exists:users,id',
            'assignment_notes' => 'nullable|string',
        ]);

        // Verify the user is actually an officer
        $officer = User::find($validated['officer_id']);
        $hasOfficerRole = $officer->roles->pluck('name')->contains(function ($role) {
            return str_contains($role, 'officer');
        });

        if (!$hasOfficerRole) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not an officer',
            ], 422);
        }

        // Verify officer is in user's hierarchy
        $manageableUsers = RoleHierarchyService::getManageableUsers($user);
        if (!$manageableUsers->contains('id', $validated['officer_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign officers within your hierarchy',
            ], 403);
        }

        $assignment = ServiceRequestAssignment::create([
            'service_request_id' => $serviceRequest->id,
            'assigned_by' => $user->id,
            'assigned_to' => $validated['officer_id'],
            'assignment_type' => 'officer',
            'assignment_notes' => $validated['assignment_notes'] ?? null,
            'assigned_date' => now(),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Officer assigned successfully',
            'data' => $assignment->load(['assignedBy', 'assignedTo']),
        ]);
    }

    /**
     * Accept an assignment
     */
    public function acceptAssignment(Request $request, ServiceRequestAssignment $assignment)
    {
        $user = $request->user();

        try {
            $assignment->accept($user);

            return response()->json([
                'success' => true,
                'message' => 'Assignment accepted successfully',
                'data' => $assignment->fresh(['assignedBy', 'assignedTo']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Start working on an assignment
     */
    public function startAssignment(Request $request, ServiceRequestAssignment $assignment)
    {
        $user = $request->user();

        try {
            $assignment->start($user);

            return response()->json([
                'success' => true,
                'message' => 'Assignment started successfully',
                'data' => $assignment->fresh(['assignedBy', 'assignedTo']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Complete an assignment
     */
    public function completeAssignment(Request $request, ServiceRequestAssignment $assignment)
    {
        $user = $request->user();

        try {
            $assignment->complete($user);

            return response()->json([
                'success' => true,
                'message' => 'Assignment completed successfully',
                'data' => $assignment->fresh(['assignedBy', 'assignedTo']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
