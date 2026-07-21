<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Console\Command;

class VerifyRBACSetupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify RBAC system setup and integrity';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('========================================');
        $this->info('  RBAC System Verification');
        $this->info('========================================');
        $this->newLine();

        $hasIssues = false;

        // Check Roles
        $this->info('📋 Checking Roles...');
        $rolesCount = Role::count();
        if ($rolesCount === 0) {
            $this->warn('  ⚠ No roles found! Run: php artisan db:seed --class=RolesAndPermissionsSeeder');
            $hasIssues = true;
        } else {
            $this->line("  ✓ Found {$rolesCount} roles");
            
            // Show sample roles
            $sampleRoles = Role::take(5)->get();
            foreach ($sampleRoles as $role) {
                $permCount = $role->permissions()->count();
                $userCount = $role->users()->count();
                $this->line("    - {$role->display_name} ({$permCount} permissions, {$userCount} users)");
            }
        }
        $this->newLine();

        // Check Permissions
        $this->info('🔐 Checking Permissions...');
        $permissionsCount = Permission::count();
        if ($permissionsCount === 0) {
            $this->warn('  ⚠ No permissions found! Run: php artisan db:seed --class=RolesAndPermissionsSeeder');
            $hasIssues = true;
        } else {
            $this->line("  ✓ Found {$permissionsCount} permissions");
            
            // Group by module
            $modules = Permission::select('module')
                ->distinct()
                ->whereNotNull('module')
                ->pluck('module');
            
            $this->line("  ✓ Organized into " . $modules->count() . " modules:");
            foreach ($modules as $module) {
                $count = Permission::where('module', $module)->count();
                $this->line("    - {$module}: {$count} permissions");
            }
        }
        $this->newLine();

        // Check Users
        $this->info('👥 Checking Users...');
        $usersCount = User::count();
        $usersWithRoles = User::has('roles')->count();
        $usersWithoutRoles = $usersCount - $usersWithRoles;

        $this->line("  ✓ Total users: {$usersCount}");
        $this->line("  ✓ Users with roles: {$usersWithRoles}");
        
        if ($usersWithoutRoles > 0) {
            $this->warn("  ⚠ Users without roles: {$usersWithoutRoles}");
            $hasIssues = true;
        }
        $this->newLine();

        // Check Role-Permission relationships
        $this->info('🔗 Checking Role-Permission Relationships...');
        $rolesWithoutPermissions = Role::doesntHave('permissions')->count();
        if ($rolesWithoutPermissions > 0) {
            $this->warn("  ⚠ {$rolesWithoutPermissions} roles have no permissions assigned");
            $hasIssues = true;
        } else {
            $this->line('  ✓ All roles have permissions assigned');
        }
        $this->newLine();

        // Check Middleware Registration
        $this->info('⚙️  Checking Middleware...');
        $middlewareAliases = [
            'role' => \App\Http\Middleware\CheckRole::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'permission.any' => \App\Http\Middleware\CheckAnyPermission::class,
            'permission.all' => \App\Http\Middleware\CheckAllPermissions::class,
        ];

        foreach ($middlewareAliases as $alias => $class) {
            if (class_exists($class)) {
                $this->line("  ✓ Middleware '{$alias}' -> {$class}");
            } else {
                $this->error("  ✗ Middleware class not found: {$class}");
                $hasIssues = true;
            }
        }
        $this->newLine();

        // Check Database Tables
        $this->info('🗄️  Checking Database Tables...');
        $tables = ['roles', 'permissions', 'role_user', 'permission_role'];
        foreach ($tables as $table) {
            try {
                \DB::table($table)->limit(1)->get();
                $count = \DB::table($table)->count();
                $this->line("  ✓ Table '{$table}' exists ({$count} records)");
            } catch (\Exception $e) {
                $this->error("  ✗ Table '{$table}' not found or has issues");
                $hasIssues = true;
            }
        }
        $this->newLine();

        // Summary
        $this->info('========================================');
        if ($hasIssues) {
            $this->warn('⚠  RBAC System has some issues (see above)');
            $this->newLine();
            $this->info('Recommended actions:');
            $this->line('  1. Run: php artisan db:seed --class=RolesAndPermissionsSeeder');
            $this->line('  2. Run: php artisan db:seed --class=DefaultUsersSeeder');
            $this->line('  3. Check middleware registration in bootstrap/app.php');
            return 1;
        } else {
            $this->info('✓ RBAC System is properly configured!');
            $this->newLine();
            $this->info('Summary:');
            $this->line("  • {$rolesCount} roles");
            $this->line("  • {$permissionsCount} permissions");
            $this->line("  • {$usersCount} users ({$usersWithRoles} with roles)");
            return 0;
        }
    }
}
