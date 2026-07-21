<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExportRBACCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:export 
                            {--format=json : Export format (json, csv)}
                            {--output= : Output file path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export RBAC configuration to file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $format = $this->option('format');
        $output = $this->option('output') ?? storage_path("app/rbac-export.{$format}");

        $this->info('Exporting RBAC configuration...');

        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        $data = [
            'exported_at' => now()->toIso8601String(),
            'roles' => $roles->map(function ($role) {
                return [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                ];
            })->toArray(),
            'permissions' => $permissions->map(function ($permission) {
                return [
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'module' => $permission->module,
                    'description' => $permission->description,
                ];
            })->toArray(),
        ];

        if ($format === 'json') {
            File::put($output, json_encode($data, JSON_PRETTY_PRINT));
        } elseif ($format === 'csv') {
            $this->exportToCsv($data, $output);
        }

        $this->info("RBAC configuration exported to: {$output}");
        $this->info("Total roles: " . count($data['roles']));
        $this->info("Total permissions: " . count($data['permissions']));

        return 0;
    }

    /**
     * Export data to CSV format.
     */
    protected function exportToCsv(array $data, string $output): void
    {
        $csv = fopen($output, 'w');

        // Write roles
        fputcsv($csv, ['ROLES']);
        fputcsv($csv, ['Name', 'Display Name', 'Description', 'Permissions']);
        
        foreach ($data['roles'] as $role) {
            fputcsv($csv, [
                $role['name'],
                $role['display_name'],
                $role['description'],
                implode(';', $role['permissions']),
            ]);
        }

        fputcsv($csv, []);

        // Write permissions
        fputcsv($csv, ['PERMISSIONS']);
        fputcsv($csv, ['Name', 'Display Name', 'Module', 'Description']);
        
        foreach ($data['permissions'] as $permission) {
            fputcsv($csv, [
                $permission['name'],
                $permission['display_name'],
                $permission['module'],
                $permission['description'],
            ]);
        }

        fclose($csv);
    }
}
