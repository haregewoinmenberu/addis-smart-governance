<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;

class RolePolicy
{
    /**
     * Determine if the user can view any roles.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can view the role.
     */
    public function view(User $user, Role $role): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can create roles.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can update the role.
     */
    public function update(User $user, Role $role): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can delete the role.
     */
    public function delete(User $user, Role $role): bool
    {
        // Prevent deletion if role has users
        if ($role->users()->count() > 0) {
            return false;
        }

        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine if the user can assign permissions to the role.
     */
    public function assignPermissions(User $user, Role $role): bool
    {
        return $user->hasPermission('manage_roles');
    }
}
