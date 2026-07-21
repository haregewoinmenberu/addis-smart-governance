<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Get all roles with their permissions.
     */
    public function index(Request $request)
    {
        $query = Role::with('permissions');

        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'display_name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 20);
        $roles = $query->paginate($perPage);

        return response()->json($roles);
    }

    /**
     * Get a single role with permissions.
     */
    public function show($id)
    {
        $role = Role::with(['permissions', 'users'])->findOrFail($id);

        return response()->json([
            'role' => $role,
            'users_count' => $role->users()->count(),
        ]);
    }

    /**
     * Create a new role.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'unique:roles,name', 'max:255'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        DB::beginTransaction();
        try {
            $role = Role::create([
                'name' => $data['name'],
                'display_name' => $data['display_name'],
                'description' => $data['description'] ?? null,
            ]);

            // Attach permissions if provided
            if (isset($data['permissions'])) {
                $role->permissions()->sync($data['permissions']);
            }

            ActivityLog::log('create_role', 'roles', $request->user(), null, $role->toArray());

            DB::commit();

            $role->load('permissions');

            return response()->json([
                'message' => 'Role created successfully',
                'role' => $role,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a role.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $data = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        DB::beginTransaction();
        try {
            $oldValues = $role->toArray();

            // Update basic info
            $role->update([
                'display_name' => $data['display_name'] ?? $role->display_name,
                'description' => $data['description'] ?? $role->description,
            ]);

            // Sync permissions if provided
            if (isset($data['permissions'])) {
                $role->permissions()->sync($data['permissions']);
            }

            ActivityLog::log('update_role', 'roles', $request->user(), $oldValues, $role->toArray());

            DB::commit();

            $role->load('permissions');

            return response()->json([
                'message' => 'Role updated successfully',
                'role' => $role,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a role.
     */
    public function destroy(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Check if role has users
        $usersCount = $role->users()->count();
        if ($usersCount > 0) {
            return response()->json([
                'message' => "Cannot delete role. It is assigned to {$usersCount} user(s).",
            ], 422);
        }

        DB::beginTransaction();
        try {
            $oldValues = $role->toArray();
            $role->delete();

            ActivityLog::log('delete_role', 'roles', $request->user(), $oldValues, null);

            DB::commit();

            return response()->json([
                'message' => 'Role deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign permissions to a role.
     */
    public function assignPermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        DB::beginTransaction();
        try {
            $oldPermissions = $role->permissions->pluck('id')->toArray();
            $role->permissions()->sync($data['permissions']);

            ActivityLog::log('assign_permissions_to_role', 'roles', $request->user(), [
                'role_id' => $role->id,
                'old_permissions' => $oldPermissions,
            ], [
                'role_id' => $role->id,
                'new_permissions' => $data['permissions'],
            ]);

            DB::commit();

            $role->load('permissions');

            return response()->json([
                'message' => 'Permissions assigned successfully',
                'role' => $role,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to assign permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get users assigned to a role.
     */
    public function users($id)
    {
        $role = Role::findOrFail($id);
        $users = $role->users()
            ->select(['id', 'name', 'email', 'phone', 'department', 'is_active'])
            ->paginate(20);

        return response()->json($users);
    }
}
