<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListUserRolesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:list-roles {--all : Show all users, not just those with roles}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users and their assigned roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $showAll = $this->option('all');
        
        $this->info("=== User Roles Report ===\n");
        
        $query = User::with('roles.permissions');
        
        if (!$showAll) {
            $query->whereHas('roles');
        }
        
        $users = $query->orderBy('id')->get();
        
        if ($users->isEmpty()) {
            $this->warn("No users found" . ($showAll ? "" : " with roles"));
            $this->info("\nTip: Use --all flag to show all users");
            return 0;
        }
        
        $headers = ['ID', 'Name', 'Email', 'Roles', 'Permissions', 'Active'];
        $rows = [];
        
        foreach ($users as $user) {
            $roles = $user->roles->pluck('display_name')->join(', ') ?: 'None';
            $permissionCount = count($user->getAllPermissions());
            $active = $user->is_active ? '✓' : '✗';
            
            $rows[] = [
                $user->id,
                $user->name,
                $user->email,
                $roles,
                $permissionCount,
                $active,
            ];
        }
        
        $this->table($headers, $rows);
        
        // Summary
        $totalUsers = $users->count();
        $usersWithRoles = $users->filter(fn($u) => $u->roles->isNotEmpty())->count();
        $usersWithoutRoles = $totalUsers - $usersWithRoles;
        
        $this->info("\nSummary:");
        $this->line("  Total users: {$totalUsers}");
        $this->line("  Users with roles: {$usersWithRoles}");
        
        if ($usersWithoutRoles > 0) {
            $this->warn("  Users without roles: {$usersWithoutRoles}");
            $this->info("\nTo fix users without roles:");
            $this->line("  php artisan user:verify-roles --fix");
        }
        
        // Role distribution
        $this->info("\nRole Distribution:");
        $roleStats = [];
        foreach ($users as $user) {
            foreach ($user->roles as $role) {
                if (!isset($roleStats[$role->display_name])) {
                    $roleStats[$role->display_name] = 0;
                }
                $roleStats[$role->display_name]++;
            }
        }
        
        if (empty($roleStats)) {
            $this->warn("  No roles assigned to any users");
        } else {
            foreach ($roleStats as $roleName => $count) {
                $this->line("  {$roleName}: {$count}");
            }
        }
        
        return 0;
    }
}
