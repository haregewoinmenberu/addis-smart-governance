<?php

namespace App\Traits;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRolesAndPermissions
{
    /**
     * Get the roles for the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withTimestamps();
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string|array $role): bool
    {
        if (is_array($role)) {
            return $this->roles()->whereIn('name', $role)->exists();
        }

        return $this->roles()->where('name', $role)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->count() === count($roles);
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->user_type === 'INSTITUTIONAL') {
            if (in_array($permission, [
                'view_dashboard',
                'view_institution_dashboard',
                'view_notifications',
                'view_settings'
            ])) {
                return true;
            }
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->user_type === 'INSTITUTIONAL') {
            $implicit = ['view_dashboard', 'view_institution_dashboard', 'view_notifications', 'view_settings'];
            if (count(array_intersect($permissions, $implicit)) > 0) {
                return true;
            }
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions);
            })
            ->exists();
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $userPermissions = $this->getAllPermissions();
        return count(array_intersect($permissions, $userPermissions)) === count($permissions);
    }

    /**
     * Get all permissions for the user through their roles.
     * Returns an array of permission names.
     */
    public function getAllPermissions()
    {
        // Ensure roles are loaded
        if (!$this->relationLoaded('roles')) {
            $this->load('roles.permissions');
        }

        // Get all unique permission names from all roles
        $permissions = [];
        foreach ($this->roles as $role) {
            foreach ($role->permissions as $permission) {
                $permissions[] = $permission->name;
            }
        }

        if ($this->user_type === 'INSTITUTIONAL') {
            $permissions = array_merge($permissions, [
                'view_dashboard',
                'view_institution_dashboard',
                'view_notifications',
                'view_settings'
            ]);
        }

        return array_values(array_unique($permissions));
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(string|Role $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->syncWithoutDetaching([$role->id]);
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(string|Role $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);
    }

    /**
     * Sync roles for the user.
     */
    public function syncRoles(array $roles): void
    {
        $roleIds = [];
        foreach ($roles as $role) {
            if (is_string($role)) {
                $roleModel = Role::where('name', $role)->first();
                if ($roleModel) {
                    $roleIds[] = $roleModel->id;
                }
            } elseif ($role instanceof Role) {
                $roleIds[] = $role->id;
            } elseif (is_numeric($role)) {
                $roleIds[] = $role;
            }
        }

        $this->roles()->sync($roleIds);
    }

    // ========================================
    // Hierarchy-Specific Role Checks
    // ========================================

    /**
     * Check if user is ITDB Administrator (Top Authority).
     */
    public function isITDBAdministrator(): bool
    {
        return $this->hasRole('itdb_administrator');
    }

    /**
     * Check if user is ITDB Auditor.
     */
    public function isITDBAuditor(): bool
    {
        return $this->hasRole('itdb_auditor');
    }

    /**
     * Check if user is any ITDB role (Administrator or Auditor).
     */
    public function isITDBUser(): bool
    {
        return $this->hasAnyRole(['itdb_administrator', 'itdb_auditor']);
    }

    /**
     * Check if user can create users.
     */
    public function canCreateUsers(): bool
    {
        return $this->hasAnyPermission(['create_users', 'create_itdb_users']);
    }

    /**
     * Check if user can approve workflows.
     */
    public function canApproveWorkflows(): bool
    {
        return $this->hasPermission('approve_workflows');
    }

    /**
     * Check if user has final approval authority.
     */
    public function hasFinalApprovalAuthority(): bool
    {
        return $this->hasPermission('final_approval');
    }

    /**
     * Check if user can override workflow decisions.
     */
    public function canOverrideWorkflows(): bool
    {
        return $this->hasPermission('override_workflows');
    }

    /**
     * Check if user can view system-wide data.
     */
    public function canViewSystemWideData(): bool
    {
        return $this->hasAnyPermission([
            'view_all_users',
            'view_all_requests',
            'view_all_technologies',
            'view_all_audits',
            'view_system_reports',
        ]);
    }

    /**
     * Check if user can conduct feasibility studies.
     */
    public function canConductFeasibilityStudies(): bool
    {
        return $this->hasPermission('conduct_feasibility');
    }

    /**
     * Check if user can perform duplication analysis.
     */
    public function canPerformDuplicationAnalysis(): bool
    {
        return $this->hasPermission('perform_duplication_analysis');
    }

    /**
     * Check if user can collect data.
     */
    public function canCollectData(): bool
    {
        return $this->hasAnyPermission(['encode_data', 'collect_field_data', 'gather_feedback']);
    }

    /**
     * Get user's hierarchy level (1=highest, 2=lowest).
     */
    public function getHierarchyLevel(): int
    {
        if ($this->isITDBAdministrator()) {
            return 1;
        } elseif ($this->isITDBAuditor()) {
            return 2;
        }

        return 3; // No role assigned
    }

    /**
     * Check if user has higher hierarchy than another user.
     */
    public function hasHigherHierarchyThan($otherUser): bool
    {
        return $this->getHierarchyLevel() < $otherUser->getHierarchyLevel();
    }

    /**
     * Check if user can manage another user (based on hierarchy).
     */
    public function canManageUser($otherUser): bool
    {
        // ITDB Admin can manage everyone
        if ($this->isITDBAdministrator()) {
            return true;
        }

        return false;
    }
}
