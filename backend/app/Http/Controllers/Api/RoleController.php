<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'data' => $roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
                'created_at' => $role->created_at,
            ]),
        ]);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        $role->load('permissions', 'users');

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $role->permissions,
                'users' => $role->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]),
            ],
        ]);
    }

    /**
     * Update role permissions.
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $permissionIds = Permission::whereIn('name', $validated['permissions'])->pluck('id');
        $role->permissions()->sync($permissionIds);

        ActivityLog::log('update_permissions', 'roles', $role, null, $validated);

        return response()->json([
            'message' => 'Permissions updated successfully',
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Get all available permissions.
     */
    public function permissions()
    {
        $permissions = Permission::all()->groupBy('module');

        return response()->json([
            'data' => $permissions->map(fn($perms, $module) => [
                'module' => $module,
                'permissions' => $perms->map(fn($perm) => [
                    'id' => $perm->id,
                    'name' => $perm->name,
                    'display_name' => $perm->display_name,
                ]),
            ])->values(),
        ]);
    }
}
