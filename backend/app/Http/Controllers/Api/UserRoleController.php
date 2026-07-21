<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserRoleController extends Controller
{
    /**
     * Get user's roles.
     */
    public function index($userId)
    {
        $user = User::with('roles.permissions')->findOrFail($userId);

        return response()->json([
            'roles' => $user->roles,
            'permissions' => $user->getAllPermissions(),
        ]);
    }

    /**
     * Assign roles to a user.
     */
    public function assign(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $data = $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['exists:roles,id'],
        ]);

        DB::beginTransaction();
        try {
            $oldRoles = $user->roles->pluck('id')->toArray();
            $user->roles()->sync($data['roles']);

            ActivityLog::log('assign_roles', 'users', $request->user(), [
                'user_id' => $user->id,
                'old_roles' => $oldRoles,
            ], [
                'user_id' => $user->id,
                'new_roles' => $data['roles'],
            ]);

            DB::commit();

            $user->load('roles.permissions');

            return response()->json([
                'message' => 'Roles assigned successfully',
                'user' => $user,
                'permissions' => $user->getAllPermissions(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to assign roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove a role from a user.
     */
    public function remove(Request $request, $userId, $roleId)
    {
        $user = User::findOrFail($userId);
        $role = Role::findOrFail($roleId);

        DB::beginTransaction();
        try {
            $user->roles()->detach($roleId);

            ActivityLog::log('remove_role', 'users', $request->user(), [
                'user_id' => $user->id,
                'role_id' => $roleId,
                'role_name' => $role->name,
            ], [
                'user_id' => $user->id,
                'removed_role' => $roleId,
            ]);

            DB::commit();

            $user->load('roles.permissions');

            return response()->json([
                'message' => 'Role removed successfully',
                'user' => $user,
                'permissions' => $user->getAllPermissions(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to remove role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add a single role to a user.
     */
    public function addRole(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $data = $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        DB::beginTransaction();
        try {
            $role = Role::findOrFail($data['role_id']);
            $user->roles()->syncWithoutDetaching([$data['role_id']]);

            ActivityLog::log('add_role', 'users', $request->user(), [
                'user_id' => $user->id,
            ], [
                'user_id' => $user->id,
                'role_id' => $data['role_id'],
                'role_name' => $role->name,
            ]);

            DB::commit();

            $user->load('roles.permissions');

            return response()->json([
                'message' => 'Role added successfully',
                'user' => $user,
                'permissions' => $user->getAllPermissions(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to add role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
