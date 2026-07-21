<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RBACService
{
    /**
     * Cache key prefix for user permissions.
     */
    protected const CACHE_PREFIX = 'user_permissions_';

    /**
     * Cache TTL in seconds (1 hour).
     */
    protected const CACHE_TTL = 3600;

    /**
     * Get user permissions with caching.
     */
    public function getUserPermissions(User $user, bool $fresh = false): array
    {
        if ($fresh) {
            $this->clearUserCache($user);
        }

        $cacheKey = self::CACHE_PREFIX . $user->id;

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user) {
            return $user->getAllPermissions();
        });
    }

    /**
     * Clear user permission cache.
     */
    public function clearUserCache(User $user): void
    {
        $cacheKey = self::CACHE_PREFIX . $user->id;
        Cache::forget($cacheKey);
    }

    /**
     * Clear all users' permission cache.
     */
    public function clearAllCache(): void
    {
        User::chunk(100, function ($users) {
            foreach ($users as $user) {
                $this->clearUserCache($user);
            }
        });
    }

    /**
     * Sync role permissions and clear affected user caches.
     */
    public function syncRolePermissions(Role $role, array $permissionIds): void
    {
        DB::transaction(function () use ($role, $permissionIds) {
            $role->permissions()->sync($permissionIds);
            
            // Clear cache for all users with this role
            $role->users()->chunk(100, function ($users) {
                foreach ($users as $user) {
                    $this->clearUserCache($user);
                }
            });
        });
    }

    /**
     * Assign roles to user and clear cache.
     */
    public function assignRolesToUser(User $user, array $roleIds): void
    {
        DB::transaction(function () use ($user, $roleIds) {
            $user->roles()->sync($roleIds);
            $this->clearUserCache($user);
        });
    }

    /**
     * Check if user has permission with caching.
     */
    public function userHasPermission(User $user, string $permission): bool
    {
        $permissions = $this->getUserPermissions($user);
        return in_array($permission, $permissions);
    }

    /**
     * Get role hierarchy level.
     */
    public function getRoleLevel(Role $role): int
    {
        // Define hierarchy levels (lower number = higher authority)
        $hierarchy = [
            'bureau_head' => 1,
            'smart_city_sector_head' => 2,
            'development_sector_head' => 2,
            'operation_sector_head' => 2,
            // Add more mappings as needed
        ];

        return $hierarchy[$role->name] ?? 999;
    }

    /**
     * Check if user can manage another user based on role hierarchy.
     */
    public function canManageUser(User $manager, User $target): bool
    {
        // Get both users' highest role levels
        $managerLevel = $this->getUserHighestRoleLevel($manager);
        $targetLevel = $this->getUserHighestRoleLevel($target);

        // Lower level number = higher authority
        return $managerLevel < $targetLevel;
    }

    /**
     * Get user's highest role level.
     */
    protected function getUserHighestRoleLevel(User $user): int
    {
        $user->load('roles');
        
        if ($user->roles->isEmpty()) {
            return 999;
        }

        return $user->roles->map(function ($role) {
            return $this->getRoleLevel($role);
        })->min();
    }

    /**
     * Get permission statistics.
     */
    public function getPermissionStats(): array
    {
        return [
            'total_permissions' => Permission::count(),
            'by_module' => Permission::select('module', DB::raw('count(*) as count'))
                ->groupBy('module')
                ->pluck('count', 'module')
                ->toArray(),
            'unassigned' => Permission::doesntHave('roles')->count(),
        ];
    }

    /**
     * Get role statistics.
     */
    public function getRoleStats(): array
    {
        return [
            'total_roles' => Role::count(),
            'with_users' => Role::has('users')->count(),
            'without_users' => Role::doesntHave('users')->count(),
            'with_permissions' => Role::has('permissions')->count(),
            'without_permissions' => Role::doesntHave('permissions')->count(),
        ];
    }

    /**
     * Get user RBAC statistics.
     */
    public function getUserStats(): array
    {
        return [
            'total_users' => User::count(),
            'with_roles' => User::has('roles')->count(),
            'without_roles' => User::doesntHave('roles')->count(),
            'by_role' => Role::withCount('users')
                ->get()
                ->pluck('users_count', 'display_name')
                ->toArray(),
        ];
    }
}
