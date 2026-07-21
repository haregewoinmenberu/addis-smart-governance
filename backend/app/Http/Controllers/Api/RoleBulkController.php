<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleBulkController extends Controller
{
    /**
     * Bulk assign roles to multiple users.
     */
    public function bulkAssign(Request $request)
    {
        $data = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['exists:users,id'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['exists:roles,id'],
        ]);

        DB::beginTransaction();
        try {
            $users = User::whereIn('id', $data['user_ids'])->get();
            $assignedCount = 0;

            foreach ($users as $user) {
                foreach ($data['role_ids'] as $roleId) {
                    $user->roles()->syncWithoutDetaching($roleId);
                }
                $assignedCount++;
            }

            ActivityLog::log('bulk_assign_roles', 'roles', $request->user(), null, [
                'user_ids' => $data['user_ids'],
                'role_ids' => $data['role_ids'],
                'users_affected' => $assignedCount,
            ]);

            DB::commit();

            return response()->json([
                'message' => "Roles assigned to {$assignedCount} user(s) successfully",
                'users_affected' => $assignedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk assignment failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk remove roles from multiple users.
     */
    public function bulkRemove(Request $request)
    {
        $data = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['exists:users,id'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['exists:roles,id'],
        ]);

        DB::beginTransaction();
        try {
            $users = User::whereIn('id', $data['user_ids'])->get();
            $affectedCount = 0;

            foreach ($users as $user) {
                $user->roles()->detach($data['role_ids']);
                $affectedCount++;
            }

            ActivityLog::log('bulk_remove_roles', 'roles', $request->user(), null, [
                'user_ids' => $data['user_ids'],
                'role_ids' => $data['role_ids'],
                'users_affected' => $affectedCount,
            ]);

            DB::commit();

            return response()->json([
                'message' => "Roles removed from {$affectedCount} user(s) successfully",
                'users_affected' => $affectedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk removal failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clone role with its permissions.
     */
    public function cloneRole(Request $request, $id)
    {
        $sourceRole = Role::with('permissions')->findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'unique:roles,name'],
            'display_name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        try {
            $newRole = Role::create($data);
            $newRole->permissions()->sync($sourceRole->permissions->pluck('id'));

            ActivityLog::log('clone_role', 'roles', $request->user(), null, [
                'source_role' => $sourceRole->name,
                'new_role' => $newRole->name,
            ]);

            DB::commit();

            $newRole->load('permissions');

            return response()->json([
                'message' => 'Role cloned successfully',
                'role' => $newRole,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to clone role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete roles.
     */
    public function bulkDelete(Request $request)
    {
        $data = $request->validate([
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['exists:roles,id'],
        ]);

        DB::beginTransaction();
        try {
            $roles = Role::whereIn('id', $data['role_ids'])->get();
            $deletedCount = 0;

            foreach ($roles as $role) {
                // Check if role has users
                if ($role->users()->count() > 0) {
                    continue;
                }
                $role->delete();
                $deletedCount++;
            }

            ActivityLog::log('bulk_delete_roles', 'roles', $request->user(), null, [
                'role_ids' => $data['role_ids'],
                'deleted_count' => $deletedCount,
            ]);

            DB::commit();

            return response()->json([
                'message' => "{$deletedCount} role(s) deleted successfully",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk deletion failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
