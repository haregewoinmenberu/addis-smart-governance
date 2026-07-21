<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SyncUserPermissionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:sync-permissions 
                            {--user= : Specific user email to sync}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync and cache user permissions from their roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userEmail = $this->option('user');

        if ($userEmail) {
            // Sync specific user
            $user = User::where('email', $userEmail)->first();
            
            if (!$user) {
                $this->error("User with email '{$userEmail}' not found!");
                return 1;
            }

            $this->syncUser($user);
        } else {
            // Sync all users
            $users = User::with('roles.permissions')->get();
            $this->info("Syncing permissions for {$users->count()} users...");
            
            $bar = $this->output->createProgressBar($users->count());
            $bar->start();

            foreach ($users as $user) {
                $this->syncUser($user);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info('All users synced successfully!');
        }

        return 0;
    }

    /**
     * Sync permissions for a single user.
     */
    protected function syncUser(User $user): void
    {
        $permissions = $user->getAllPermissions();
        
        $this->line("User: {$user->name} ({$user->email})");
        $this->line("  Roles: " . $user->roles->pluck('name')->join(', '));
        $this->line("  Permissions: " . count($permissions));
    }
}
