<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use App\Services\RoleHierarchyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        
        // Bureau Head sees everyone, others see only users they created
        if ($currentUser->hasRole('bureau_head')) {
            $query = User::with(['roles', 'institution', 'creator']);
        } else {
            // Only show users created by current user
            $query = User::with(['roles', 'institution', 'creator'])
                ->where('created_by', $currentUser->id);
        }

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by institution
        if ($request->has('institution_id')) {
            $query->where('institution_id', $request->institution_id);
        }

        // Filter by user type
        if ($request->has('user_type')) {
            $query->where('user_type', $request->user_type);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', 'like', '%' . $request->department . '%');
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'data' => $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'department' => $user->department,
                'user_type' => $user->user_type,
                'institution' => $user->institution ? [
                    'id' => $user->institution->id,
                    'name' => $user->institution->name,
                ] : null,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'last_login_at' => $user->last_login_at,
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ]),
                'created_by' => $user->creator ? [
                    'id' => $user->creator->id,
                    'name' => $user->creator->name,
                    'email' => $user->creator->email,
                ] : null,
                'created_at' => $user->created_at,
                'can_manage' => RoleHierarchyService::canManageUser($currentUser, $user),
            ]),
            'meta' => [
                'manageable_roles' => RoleHierarchyService::getManageableRoles($currentUser),
                'can_create_users' => RoleHierarchyService::hasUserManagementCapability($currentUser),
                'total_created' => $currentUser->createdUsers()->count(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'user_type' => ['required', 'in:INTERNAL,INSTITUTIONAL,EXTERNAL'],
            'institution_id' => ['nullable', 'required_if:user_type,INSTITUTIONAL', 'exists:institutions,id'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        // Validate hierarchy: can manager create users with these roles?
        $roles = $data['roles'];
        $validationErrors = RoleHierarchyService::validateUserCreation($currentUser, $roles);
        
        if (!empty($validationErrors)) {
            return response()->json([
                'message' => 'Hierarchy violation: You cannot create users with the specified roles.',
                'errors' => $validationErrors,
                'manageable_roles' => RoleHierarchyService::getManageableRoles($currentUser),
            ], 403);
        }

        // Set department from manager if not provided
        if (!isset($data['department']) && $currentUser->department) {
            $data['department'] = $currentUser->department;
        }

        // Set created_by to current user
        $data['created_by'] = $currentUser->id;

        $data['password'] = Hash::make($data['password']);
        unset($data['roles']);

        $user = User::create($data);
        
        // Assign roles
        $user->syncRoles($roles);

        ActivityLog::log('create_user', 'users', $currentUser, null, [
            'created_user_id' => $user->id,
            'created_user_email' => $user->email,
            'assigned_roles' => $roles,
        ]);

        $user->load('roles', 'institution');

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $currentUser = $request->user();
        $user = User::with('roles.permissions', 'activityLogs', 'institution', 'creator')->findOrFail($id);

        // Check if current user can view this user
        // Bureau Head can view anyone, others can only view users they created or themselves
        if (!$currentUser->hasRole('bureau_head') && 
            $user->created_by !== $currentUser->id &&
            $currentUser->id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only view users you created.',
            ], 403);
        }

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'department' => $user->department,
                'user_type' => $user->user_type,
                'institution' => $user->institution ? [
                    'id' => $user->institution->id,
                    'name' => $user->institution->name,
                ] : null,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'last_login_at' => $user->last_login_at,
                'roles' => $user->roles,
                'permissions' => $user->getAllPermissions(),
                'recent_activity' => $user->activityLogs()
                    ->latest()
                    ->limit(10)
                    ->get(),
                'created_at' => $user->created_at,
                'can_manage' => RoleHierarchyService::canManageUser($currentUser, $user),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $currentUser = $request->user();
        $user = User::findOrFail($id);

        // Check if current user can manage this user
        // Bureau Head can manage anyone, others can only manage users they created
        if (!$currentUser->hasRole('bureau_head') && 
            $user->created_by !== $currentUser->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only manage users you created.',
            ], 403);
        }
        
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'user_type' => ['sometimes', 'in:INTERNAL,INSTITUTIONAL,EXTERNAL'],
            'institution_id' => ['nullable', 'exists:institutions,id'],
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        // Validate hierarchy if roles are being changed
        if (isset($data['roles'])) {
            $roles = $data['roles'];
            $validationErrors = RoleHierarchyService::validateUserCreation($currentUser, $roles);
            
            if (!empty($validationErrors)) {
                return response()->json([
                    'message' => 'Hierarchy violation: You cannot assign these roles.',
                    'errors' => $validationErrors,
                    'manageable_roles' => RoleHierarchyService::getManageableRoles($currentUser),
                ], 403);
            }
        }

        $oldValues = $user->toArray();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (isset($data['roles'])) {
            $roles = $data['roles'];
            unset($data['roles']);
            $user->syncRoles($roles);
        }

        $user->update($data);

        ActivityLog::log('update_user', 'users', $currentUser, $oldValues, $user->toArray());

        $user->load('roles', 'institution');

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $currentUser = $request->user();
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 422);
        }

        // Check if current user can manage this user
        // Bureau Head can delete anyone, others can only delete users they created
        if (!$currentUser->hasRole('bureau_head') && 
            $user->created_by !== $currentUser->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only delete users you created.',
            ], 403);
        }

        ActivityLog::log('delete_user', 'users', $currentUser, $user->toArray(), null);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Activate/deactivate user.
     */
    public function toggleActive(Request $request, string $id)
    {
        $currentUser = $request->user();
        $user = User::findOrFail($id);

        // Prevent deactivating yourself
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot deactivate your own account',
            ], 422);
        }

        // Check if current user can manage this user
        // Bureau Head can manage anyone, others can only manage users they created
        if (!$currentUser->hasRole('bureau_head') && 
            $user->created_by !== $currentUser->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only manage users you created.',
            ], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        ActivityLog::log(
            $user->is_active ? 'activate_user' : 'deactivate_user',
            'users',
            $currentUser,
            ['is_active' => !$user->is_active],
            ['is_active' => $user->is_active]
        );

        return response()->json([
            'message' => $user->is_active ? 'User activated' : 'User deactivated',
            'data' => $user,
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        ActivityLog::log('reset_password', 'users', $user);

        return response()->json(['message' => 'Password reset successfully']);
    }

    /**
     * Get user activity logs.
     */
    public function activityLogs(string $id)
    {
        $user = User::findOrFail($id);

        $logs = $user->activityLogs()
            ->with('subject')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    /**
     * Get manageable roles for current user (for user creation).
     */
    public function manageableRoles(Request $request)
    {
        $currentUser = $request->user();
        $manageableRoleNames = RoleHierarchyService::getManageableRoles($currentUser);

        if (empty($manageableRoleNames)) {
            return response()->json([
                'data' => [],
                'message' => 'You do not have permission to create users.',
            ]);
        }

        $roles = Role::whereIn('name', $manageableRoleNames)
            ->orderBy('display_name')
            ->get();

        return response()->json([
            'data' => $roles,
            'meta' => [
                'can_create_users' => true,
                'hierarchy_level' => RoleHierarchyService::getRoleLevel($currentUser->roles->first()->name ?? ''),
            ],
        ]);
    }

    /**
     * Get hierarchy info for current user.
     */
    public function hierarchyInfo(Request $request)
    {
        $currentUser = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'department' => $currentUser->department,
                'roles' => $currentUser->roles->pluck('name'),
            ],
            'capabilities' => [
                'can_create_users' => RoleHierarchyService::hasUserManagementCapability($currentUser),
                'can_manage_count' => User::whereHas('roles', function ($query) use ($currentUser) {
                    $manageableRoles = RoleHierarchyService::getManageableRoles($currentUser);
                    $query->whereIn('name', $manageableRoles);
                })->count(),
            ],
            'manageable_roles' => RoleHierarchyService::getManageableRoles($currentUser),
            'hierarchy_map' => RoleHierarchyService::getFullHierarchyMap(),
        ]);
    }
}
