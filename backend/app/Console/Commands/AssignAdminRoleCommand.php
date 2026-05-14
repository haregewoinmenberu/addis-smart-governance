<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class AssignAdminRoleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:assign-admin {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign ITDB Administrator role to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found!");
            return 1;
        }

        $role = Role::where('name', 'itdb_administrator')->first();
        
        if (!$role) {
            $this->error("ITDB Administrator role not found! Please run: php artisan db:seed --class=RolesAndPermissionsSeeder");
            return 1;
        }

        if ($user->hasRole('itdb_administrator')) {
            $this->info("User {$user->name} already has ITDB Administrator role.");
            return 0;
        }

        $user->assignRole('itdb_administrator');
        
        $this->info("✓ Successfully assigned ITDB Administrator role to {$user->name} ({$user->email})");
        $this->newLine();
        $this->info("User now has the following roles:");
        foreach ($user->roles as $role) {
            $this->line("  • {$role->display_name}");
        }
        
        return 0;
    }
}
