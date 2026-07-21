<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * Get all permissions.
     */
    public function index(Request $request)
    {
        $query = Permission::query();

        // Filter by module
        if ($request->has('module')) {
            $query->where('module', $request->input('module'));
        }

        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Group by module if requested
        if ($request->input('group_by_module')) {
            $permissions = Permission::all()->groupBy('module');
            return response()->json($permissions);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'module');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        if ($request->input('paginate', true)) {
            $perPage = $request->input('per_page', 50);
            $permissions = $query->paginate($perPage);
        } else {
            $permissions = $query->get();
        }

        return response()->json($permissions);
    }

    /**
     * Get permission modules (unique list).
     */
    public function modules()
    {
        $modules = Permission::select('module')
            ->distinct()
            ->whereNotNull('module')
            ->orderBy('module')
            ->pluck('module');

        return response()->json($modules);
    }

    /**
     * Get a single permission.
     */
    public function show($id)
    {
        $permission = Permission::with('roles')->findOrFail($id);

        return response()->json([
            'permission' => $permission,
            'roles_count' => $permission->roles()->count(),
        ]);
    }

    /**
     * Create a new permission.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'unique:permissions,name', 'max:255'],
            'display_name' => ['required', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        try {
            $permission = Permission::create($data);

            ActivityLog::log('create_permission', 'permissions', $request->user(), null, $permission->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Permission created successfully',
                'permission' => $permission,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create permission',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a permission.
     */
    public function update(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);

        $data = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        try {
            $oldValues = $permission->toArray();
            $permission->update($data);

            ActivityLog::log('update_permission', 'permissions', $request->user(), $oldValues, $permission->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Permission updated successfully',
                'permission' => $permission,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update permission',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a permission.
     */
    public function destroy(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);

        // Check if permission is assigned to any roles
        $rolesCount = $permission->roles()->count();
        if ($rolesCount > 0) {
            return response()->json([
                'message' => "Cannot delete permission. It is assigned to {$rolesCount} role(s).",
            ], 422);
        }

        DB::beginTransaction();
        try {
            $oldValues = $permission->toArray();
            $permission->delete();

            ActivityLog::log('delete_permission', 'permissions', $request->user(), $oldValues, null);

            DB::commit();

            return response()->json([
                'message' => 'Permission deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete permission',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get roles that have this permission.
     */
    public function roles($id)
    {
        $permission = Permission::findOrFail($id);
        $roles = $permission->roles()
            ->select(['id', 'name', 'display_name', 'description'])
            ->get();

        return response()->json($roles);
    }
}
