<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;

class RoleHierarchyService
{
    /**
     * Organizational hierarchy map.
     * Each role maps to its allowed child roles (one level down).
     * 
     * Level 1: Bureau Head
     * Level 2: Sector Heads + Quality Director
     * Level 3: Directorate Directors
     * Level 4: Team Leaders / Managers
     * Level 5: Officers / Engineers / Developers
     */
    protected static array $hierarchyMap = [
        // LEVEL 1: Bureau Head - manages Sector Heads and Quality Director
        'bureau_head' => [
            'smart_city_sector_head',
            'development_sector_head',
            'operation_sector_head',
            'quality_director',
        ],

        // LEVEL 2: Smart City Sector Head - manages 3 Directors under Smart City
        'smart_city_sector_head' => [
            'capacity_building_director',
            'research_director',
            'security_director',
        ],

        // LEVEL 3: Capacity Building Director - manages Team Leader
        'capacity_building_director' => [
            'training_team_leader',
        ],

        // LEVEL 4: Training Team Leader - manages Officers
        'training_team_leader' => [
            'training_officer',
        ],

        // LEVEL 5: Training Officer - no child roles
        'training_officer' => [],

        // LEVEL 3: Research Director - manages Research Officer directly
        'research_director' => [
            'research_team_leader',
        ],

        'research_team_leader' => [
            'research_officer',
        ],

        // LEVEL 5: Research Officer - no child roles
        'research_officer' => [],

        // LEVEL 3: Security Director - manages Security Officer directly
        'security_director' => [
            'security_officer',
        ],

        // LEVEL 5: Security Officer - no child roles
        'security_officer' => [],

        // LEVEL 2: Development Sector Head - manages 3 Directors under Development
        'development_sector_head' => [
            'project_director',
            'software_development_director',
            'infrastructure_director',
        ],

        // LEVEL 3: Project Director - manages Project Manager
        'project_director' => [
            'project_manager',
        ],

        // LEVEL 4: Project Manager - no child roles
        'project_manager' => [],

        // LEVEL 3: Software Development Director - manages Team Leader
        'software_development_director' => [
            'software_team_leader',
        ],

        // LEVEL 4: Software Team Leader - manages Developers
        'software_team_leader' => [
            'software_developer',
        ],

        // LEVEL 5: Software Developer - no child roles
        'software_developer' => [],

        // LEVEL 3: Infrastructure Director - manages Engineer directly
        'infrastructure_director' => [
            'infrastructure_engineer',
        ],

        // LEVEL 5: Infrastructure Engineer - no child roles
        'infrastructure_engineer' => [],

        // LEVEL 2: Operation Sector Head - manages 2 Directors under Operation
        'operation_sector_head' => [
            'maintenance_director',
            'data_center_director',
        ],

        // LEVEL 3: Maintenance Director - manages Team Leader
        'maintenance_director' => [
            'maintenance_team_leader',
        ],

        // LEVEL 4: Maintenance Team Leader - manages Support Officers
        'maintenance_team_leader' => [
            'support_officer',
        ],

        // LEVEL 5: Support Officer - no child roles
        'support_officer' => [],

        // LEVEL 3: Data Center Director - manages Cloud Engineer directly
        'data_center_director' => [
            'cloud_engineer',
        ],

        // LEVEL 5: Cloud Engineer - no child roles
        'cloud_engineer' => [],

        // LEVEL 2: Quality Director - manages Quality Officer directly
        'quality_director' => [
            'quality_officer',
        ],

        // LEVEL 5: Quality Officer - no child roles
        'quality_officer' => [],
    ];

    /**
     * Get all roles that a user can manage (one level down).
     */
    public static function getManageableRoles(User $user): array
    {
        // Get user's primary role (first role)
        $userRoles = $user->roles->pluck('name')->toArray();
        
        if (empty($userRoles)) {
            return [];
        }

        $manageableRoles = [];

        foreach ($userRoles as $roleName) {
            if (isset(self::$hierarchyMap[$roleName])) {
                $manageableRoles = array_merge(
                    $manageableRoles,
                    self::$hierarchyMap[$roleName]
                );
            }
        }

        return array_unique($manageableRoles);
    }

    /**
     * Check if a user can create/manage users with a specific role.
     */
    public static function canManageRole(User $manager, string $targetRoleName): bool
    {
        $manageableRoles = self::getManageableRoles($manager);
        return in_array($targetRoleName, $manageableRoles);
    }

    /**
     * Check if a user can manage another user.
     */
    public static function canManageUser(User $manager, User $targetUser): bool
    {
        $targetRoles = $targetUser->roles->pluck('name')->toArray();
        
        if (empty($targetRoles)) {
            return false;
        }

        $manageableRoles = self::getManageableRoles($manager);

        // Target user must have at least one role that manager can manage
        foreach ($targetRoles as $targetRole) {
            if (in_array($targetRole, $manageableRoles)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate if user can create a new user with given roles.
     */
    public static function validateUserCreation(User $manager, array $roleNames): array
    {
        $manageableRoles = self::getManageableRoles($manager);
        $errors = [];

        foreach ($roleNames as $roleName) {
            if (!in_array($roleName, $manageableRoles)) {
                $errors[] = "You cannot create users with role: {$roleName}";
            }
        }

        return $errors;
    }

    /**
     * Get the hierarchy level of a role (lower number = higher in hierarchy).
     * 
     * Level 1: Bureau Head
     * Level 2: Sector Heads + Quality Director
     * Level 3: Directorate Directors
     * Level 4: Team Leaders / Managers
     * Level 5: Officers / Engineers / Developers
     */
    public static function getRoleLevel(string $roleName): int
    {
        // Level 1: Bureau Head
        if ($roleName === 'bureau_head') {
            return 1;
        }

        // Level 2: Sector Heads + Quality Director
        if (in_array($roleName, [
            'smart_city_sector_head',
            'development_sector_head',
            'operation_sector_head',
            'quality_director',
        ])) {
            return 2;
        }

        // Level 3: Directorate Directors
        if (in_array($roleName, [
            'capacity_building_director',
            'research_director',
            'security_director',
            'project_director',
            'software_development_director',
            'infrastructure_director',
            'maintenance_director',
            'data_center_director',
        ])) {
            return 3;
        }

        // Level 4: Team Leaders / Managers
        if (in_array($roleName, [
            'training_team_leader',
            'research_team_leader',
            'software_team_leader',
            'maintenance_team_leader',
            'project_manager',
        ])) {
            return 4;
        }

        // Level 5: Officers / Engineers / Developers / Support Staff
        if (in_array($roleName, [
            'training_officer',
            'research_officer',
            'security_officer',
            'software_developer',
            'infrastructure_engineer',
            'support_officer',
            'cloud_engineer',
            'quality_officer',
        ])) {
            return 5;
        }

        return 6; // Unknown role
    }

    /**
     * Check if user has user management capability.
     */
    public static function hasUserManagementCapability(User $user): bool
    {
        $manageableRoles = self::getManageableRoles($user);
        return !empty($manageableRoles);
    }

    /**
     * Get all users that a manager can assign tasks/requests to.
     * Returns users with roles one level below the manager.
     */
    public static function getManageableUsers(User $manager)
    {
        $manageableRoles = self::getManageableRoles($manager);
        
        if (empty($manageableRoles)) {
            return collect([]);
        }

        // Get all users with these roles
        return User::whereHas('roles', function ($query) use ($manageableRoles) {
            $query->whereIn('name', $manageableRoles);
        })
        ->with('roles')
        ->where('is_active', true)
        ->orderBy('name')
        ->get();
    }

    /**
     * Get all roles with their manageable children.
     */
    public static function getFullHierarchyMap(): array
    {
        return self::$hierarchyMap;
    }

    /**
     * Get ALL roles that a manager can manage at ANY depth below them.
     * e.g. research_director → [research_team_leader, research_officer]
     */
    public static function getAllManageableRolesRecursive(User $user): array
    {
        $userRoles = $user->roles->pluck('name')->toArray();
        $allRoles = [];

        foreach ($userRoles as $roleName) {
            $allRoles = array_merge($allRoles, self::getChildRolesRecursive($roleName));
        }

        return array_values(array_unique($allRoles));
    }

    /**
     * Recursively collect all child roles from the hierarchy map.
     */
    protected static function getChildRolesRecursive(string $roleName, array $visited = []): array
    {
        if (in_array($roleName, $visited)) {
            return []; // prevent infinite loops
        }

        $visited[] = $roleName;
        $directChildren = self::$hierarchyMap[$roleName] ?? [];
        $allChildren = $directChildren;

        foreach ($directChildren as $childRole) {
            $allChildren = array_merge(
                $allChildren,
                self::getChildRolesRecursive($childRole, $visited)
            );
        }

        return $allChildren;
    }

    /**
     * Get ALL users that a manager can manage at ANY depth (recursive).
     * e.g. research_director gets both research_team_leaders AND research_officers.
     */
    public static function getAllManageableUsersRecursive(User $manager)
    {
        $allRoles = self::getAllManageableRolesRecursive($manager);

        if (empty($allRoles)) {
            return collect([]);
        }

        return User::whereHas('roles', function ($query) use ($allRoles) {
            $query->whereIn('name', $allRoles);
        })
        ->with('roles')
        ->where('is_active', true)
        ->orderBy('name')
        ->get();
    }

    /**
     * Filter users list to only show users this manager can manage.
     */
    public static function filterManageableUsers(User $manager, $usersQuery)
    {
        $manageableRoles = self::getManageableRoles($manager);
        
        if (empty($manageableRoles)) {
            // Return empty query if manager cannot manage anyone
            return $usersQuery->whereRaw('1 = 0');
        }

        // Filter users who have at least one manageable role
        return $usersQuery->whereHas('roles', function ($query) use ($manageableRoles) {
            $query->whereIn('name', $manageableRoles);
        });
    }

    /**
     * Check organizational scope (same department/sector).
     */
    public static function isInSameOrganizationalScope(User $manager, User $targetUser): bool
    {
        // If manager and target have no department, scope check passes
        if (!$manager->department && !$targetUser->department) {
            return true;
        }

        // Bureau Head can manage all departments
        if ($manager->hasRole('bureau_head')) {
            return true;
        }

        // Sector heads can manage their entire sector
        $sectorHeadRoles = [
            'smart_city_sector_head',
            'development_sector_head',
            'operation_sector_head',
        ];

        foreach ($sectorHeadRoles as $sectorRole) {
            if ($manager->hasRole($sectorRole)) {
                $sectorName = str_replace('_sector_head', '', $sectorRole);
                $sectorName = str_replace('_', ' ', $sectorName);
                
                // Check if target's department contains the sector name
                if (stripos($targetUser->department ?? '', $sectorName) !== false) {
                    return true;
                }
            }
        }

        // For directors and below, department must match exactly or be within same directorate
        return self::isDepartmentMatch($manager->department, $targetUser->department);
    }

    /**
     * Check if departments match or are in the same directorate/sector.
     */
    protected static function isDepartmentMatch(?string $managerDept, ?string $targetDept): bool
    {
        if (!$managerDept || !$targetDept) {
            return false;
        }

        // Exact match
        if ($managerDept === $targetDept) {
            return true;
        }

        // Check if they belong to the same directorate/sector
        $managerBase = self::extractBaseDepartment($managerDept);
        $targetBase = self::extractBaseDepartment($targetDept);

        return $managerBase === $targetBase;
    }

    /**
     * Extract base department name (remove team/unit suffixes).
     */
    protected static function extractBaseDepartment(string $department): string
    {
        // Extract the main directorate/sector name
        // e.g., "Software and Platform Development Directorate" from any sub-unit
        
        $patterns = [
            '/ Team$/i',
            '/ Unit$/i',
            '/ Section$/i',
        ];

        $cleaned = $department;
        foreach ($patterns as $pattern) {
            $cleaned = preg_replace($pattern, '', $cleaned);
        }

        return trim($cleaned);
    }

    /**
     * Get users that a manager can view in the user list.
     */
    public static function getViewableUsers(User $manager)
    {
        // Bureau Head sees everyone
        if ($manager->hasRole('bureau_head')) {
            return User::with(['roles', 'institution']);
        }

        $manageableRoles = self::getManageableRoles($manager);
        
        if (empty($manageableRoles)) {
            // If cannot manage anyone, only see themselves
            return User::where('id', $manager->id)->with(['roles', 'institution']);
        }

        // Show users with manageable roles in the same organizational scope
        return User::with(['roles', 'institution'])
            ->whereHas('roles', function ($query) use ($manageableRoles) {
                $query->whereIn('name', $manageableRoles);
            })
            ->where(function ($query) use ($manager) {
                // Same department or within manageable scope
                if ($manager->department) {
                    $query->where('department', 'like', '%' . self::extractBaseDepartment($manager->department) . '%');
                }
            });
    }
}
