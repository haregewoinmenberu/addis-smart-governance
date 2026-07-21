<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

class RBACDebugController extends Controller
{
    /**
     * Get comprehensive RBAC debug information for current user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $user->load('roles.permissions');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
            ],
            'roles' => $user->roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'permissions_count' => $role->permissions->count(),
            ]),
            'permissions' => $user->getAllPermissions(),
            'grouped_permissions' => collect($user->getAllPermissions())->groupBy(function($permission) {
                $parts = explode('_', $permission);
                return count($parts) > 1 ? end($parts) : 'general';
            }),
            'system_stats' => [
                'total_roles' => Role::count(),
                'total_permissions' => Permission::count(),
                'total_users' => User::count(),
            ],
        ]);
    }

    /**
     * Check specific permission for current user.
     */
    public function checkPermission(Request $request, string $permission)
    {
        $user = $request->user();
        $hasPermission = $user->hasPermission($permission);

        return response()->json([
            'permission' => $permission,
            'has_permission' => $hasPermission,
            'user_permissions' => $user->getAllPermissions(),
        ]);
    }

    /**
     * Check specific role for current user.
     */
    public function checkRole(Request $request, string $role)
    {
        $user = $request->user();
        $hasRole = $user->hasRole($role);

        return response()->json([
            'role' => $role,
            'has_role' => $hasRole,
            'user_roles' => $user->roles->pluck('name'),
        ]);
    }
}
