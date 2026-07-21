<?php

namespace App\Console\Commands;

use App\Models\Permission;
use Illuminate\Console\Command;

class ListPermissionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:list-permissions 
                            {--module= : Filter by module}
                            {--role= : Filter by role name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all permissions with optional filtering';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $module = $this->option('module');
        $roleName = $this->option('role');

        $query = Permission::query();

        if ($module) {
            $query->where('module', $module);
            $this->info("Filtering by module: {$module}");
        }

        if ($roleName) {
            $query->whereHas('roles', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            });
            $this->info("Filtering by role: {$roleName}");
        }

        $permissions = $query->orderBy('module')->orderBy('name')->get();

        if ($permissions->isEmpty()) {
            $this->warn('No permissions found matching the criteria.');
            return 0;
        }

        $this->info("Found {$permissions->count()} permissions:");
        $this->newLine();

        // Group by module
        $grouped = $permissions->groupBy('module');

        foreach ($grouped as $module => $perms) {
            $this->line("<fg=cyan;options=bold>" . strtoupper($module ?: 'GENERAL') . "</>");
            
            $this->table(
                ['ID', 'Name', 'Display Name'],
                $perms->map(fn($p) => [$p->id, $p->name, $p->display_name])->toArray()
            );
            
            $this->newLine();
        }

        return 0;
    }
}
