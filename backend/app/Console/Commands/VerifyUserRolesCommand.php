<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class VerifyUserRolesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:verify-roles {--fix : Automatically fix users without roles}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify all users have proper roles assigned';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verifying user roles...');
        $this->newLine();

        $users = User::with('roles')->get();
        $usersWithoutRoles = [];
        $usersWithRoles = [];

        foreach ($users as $user) {
            if ($user->roles->isEmpty()) {
                $usersWithoutRoles[] = $user;
            } else {
                $usersWithRoles[] = $user;
            }
        }

        // Display users with roles
        if (!empty($usersWithRoles)) {
            $this->info('✓ Users with roles assigned:');
            $this->table(
                ['ID', 'Name', 'Email', 'Roles'],
                collect($usersWithRoles)->map(function ($user) {
                    return [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->roles->pluck('display_name')->implode(', '),
                    ];
                })
            );
            $this->newLine();
        }

        // Display users without roles
        if (!empty($usersWithoutRoles)) {
            $this->warn('⚠ Users WITHOUT roles:');
            $this->table(
                ['ID', 'Name', 'Email', 'Sub-City'],
                collect($usersWithoutRoles)->map(function ($user) {
                    return [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->subCity?->name ?? 'N/A',
                    ];
                })
            );
            $this->newLine();

            if ($this->option('fix')) {
                $this->info('Attempting to fix users without roles...');
                $this->fixUsersWithoutRoles($usersWithoutRoles);
            } else {
                $this->warn('Run with --fix option to automatically assign roles based on email patterns.');
            }
        } else {
            $this->info('✓ All users have roles assigned!');
        }

        $this->newLine();
        $this->info('Summary:');
        $this->line("  Total users: " . $users->count());
        $this->line("  With roles: " . count($usersWithRoles));
        $this->line("  Without roles: " . count($usersWithoutRoles));

        return 0;
    }

    protected function fixUsersWithoutRoles($users)
    {
        $fixed = 0;

        foreach ($users as $user) {
            $role = $this->determineRole($user);

            if ($role) {
                $user->assignRole($role);
                $this->info("  ✓ Assigned '{$role}' to {$user->name} ({$user->email})");
                $fixed++;
            } else {
                $this->warn("  ✗ Could not determine role for {$user->name} ({$user->email})");
            }
        }

        $this->newLine();
        $this->info("Fixed {$fixed} users.");
    }

    protected function determineRole(User $user): ?string
    {
        $email = $user->email;

        // Check email patterns
        if (str_contains($email, '@itdb.gov.et')) {
            if (str_contains($email, 'admin')) {
                return 'itdb_administrator';
            }
            if (str_contains($email, 'auditor')) {
                return 'itdb_auditor';
            }
            // Default ITDB users to auditor
            return 'itdb_auditor';
        }

        // Sub-city users
        if ($user->sub_city_id) {
            if (str_contains($email, 'admin')) {
                return 'sub_city_admin';
            }
            if (str_contains($email, 'auditor')) {
                return 'sub_city_auditor';
            }
            // Default sub-city users to auditor
            return 'sub_city_auditor';
        }

        // Check by name patterns
        if (str_contains(strtolower($user->name), 'administrator')) {
            if ($user->sub_city_id) {
                return 'sub_city_admin';
            }
            return 'itdb_administrator';
        }

        if (str_contains(strtolower($user->name), 'auditor')) {
            if ($user->sub_city_id) {
                return 'sub_city_auditor';
            }
            return 'itdb_auditor';
        }

        return null;
    }
}
