<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class AssignRoleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:assign-role 
                            {email : User email address}
                            {role : Role name to assign}
                            {--remove : Remove the role instead of assigning}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign or remove a role from a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $roleName = $this->argument('role');
        $remove = $this->option('remove');

        // Find user
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email '{$email}' not found!");
            return 1;
        }

        // Find role
        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            $this->error("Role '{$roleName}' not found!");
            return 1;
        }

        if ($remove) {
            // Remove role
            $user->removeRole($role);
            $this->info("Role '{$role->display_name}' removed from user '{$user->name}'");
        } else {
            // Assign role
            $user->assignRole($role);
            $this->info("Role '{$role->display_name}' assigned to user '{$user->name}'");
        }

        // Show user's current roles
        $user->load('roles');
        $this->newLine();
        $this->info("User's current roles:");
        $this->table(
            ['Role Name', 'Display Name'],
            $user->roles->map(fn($r) => [$r->name, $r->display_name])->toArray()
        );

        return 0;
    }
}
