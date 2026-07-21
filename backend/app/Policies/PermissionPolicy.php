<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Permission;

class PermissionPolicy
{
    /**
     * Determine if the user can view any permissions.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can view the permission.
     */
    public function view(User $user, Permission $permission): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can create permissions.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can update the permission.
     */
    public function update(User $user, Permission $permission): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can delete the permission.
     */
    public function delete(User $user, Permission $permission): bool
    {
        // Prevent deletion if permission is assigned to roles
        if ($permission->roles()->count() > 0) {
            return false;
        }

        return $user->hasPermission('manage_roles');
    }
}
