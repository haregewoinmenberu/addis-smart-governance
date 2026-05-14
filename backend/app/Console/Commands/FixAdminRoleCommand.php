<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class FixAdminRoleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:fix-admin-role {email=admin@itdb.gov.et}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix admin user role assignment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Fixing role for user: {$email}");
        
        // Find the user
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User not found: {$email}");
            return 1;
        }
        
        $this->info("Found user: {$user->name} (ID: {$user->id})");
        
        // Find the itdb_administrator role
        $role = Role::where('name', 'itdb_administrator')->first();
        
        if (!$role) {
            $this->error("Role 'itdb_administrator' not found. Please run: php artisan db:seed --class=RolesAndPermissionsSeeder");
            return 1;
        }
        
        $this->info("Found role: {$role->display_name} (ID: {$role->id})");
        
        // Check current roles
        $currentRoles = $user->roles()->pluck('name')->toArray();
        $this->info("Current roles: " . (empty($currentRoles) ? 'None' : implode(', ', $currentRoles)));
        
        // Assign the role
        if (!$user->hasRole('itdb_administrator')) {
            $user->assignRole($role);
            $this->info("✓ Assigned 'itdb_administrator' role to {$user->name}");
        } else {
            $this->info("✓ User already has 'itdb_administrator' role");
        }
        
        // Verify the assignment
        $user->load('roles.permissions');
        $permissions = $user->getAllPermissions();
        
        $this->info("User now has {$user->roles->count()} role(s) and " . count($permissions) . " permission(s)");
        
        if ($this->option('verbose')) {
            $this->info("\nRoles:");
            foreach ($user->roles as $role) {
                $this->line("  - {$role->display_name} ({$role->name})");
            }
            
            $this->info("\nPermissions (first 10):");
            foreach (array_slice($permissions, 0, 10) as $permission) {
                $this->line("  - {$permission}");
            }
            if (count($permissions) > 10) {
                $this->line("  ... and " . (count($permissions) - 10) . " more");
            }
        }
        
        $this->info("\n✓ Role assignment completed successfully!");
        
        return 0;
    }
}
