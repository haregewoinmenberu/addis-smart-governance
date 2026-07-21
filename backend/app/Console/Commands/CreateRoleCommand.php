<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Console\Command;

class CreateRoleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:create-role 
                            {name : The role name (slug)}
                            {display_name : The role display name}
                            {--description= : Role description}
                            {--permissions=* : Permission names to assign}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new role with optional permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $displayName = $this->argument('display_name');
        $description = $this->option('description');
        $permissionNames = $this->option('permissions');

        // Check if role already exists
        if (Role::where('name', $name)->exists()) {
            $this->error("Role '{$name}' already exists!");
            return 1;
        }

        // Create role
        $role = Role::create([
            'name' => $name,
            'display_name' => $displayName,
            'description' => $description,
        ]);

        $this->info("Role '{$displayName}' created successfully!");

        // Assign permissions if provided
        if (!empty($permissionNames)) {
            $permissions = Permission::whereIn('name', $permissionNames)->get();
            
            if ($permissions->count() !== count($permissionNames)) {
                $found = $permissions->pluck('name')->toArray();
                $missing = array_diff($permissionNames, $found);
                $this->warn("Warning: Some permissions not found: " . implode(', ', $missing));
            }

            if ($permissions->count() > 0) {
                $role->permissions()->sync($permissions->pluck('id')->toArray());
                $this->info("Assigned {$permissions->count()} permissions to the role.");
            }
        }

        $this->table(
            ['ID', 'Name', 'Display Name', 'Permissions'],
            [[$role->id, $role->name, $role->display_name, $role->permissions()->count()]]
        );

        return 0;
    }
}
