<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportRBACCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rbac:import 
                            {file : Path to import file}
                            {--force : Force import without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import RBAC configuration from file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File not found: {$file}");
            return 1;
        }

        $data = json_decode(file_get_contents($file), true);

        if (!$data) {
            $this->error('Invalid JSON file');
            return 1;
        }

        $this->info('Import Summary:');
        $this->info('Roles: ' . count($data['roles'] ?? []));
        $this->info('Permissions: ' . count($data['permissions'] ?? []));
        $this->newLine();

        if (!$this->option('force') && !$this->confirm('Do you want to proceed with import?')) {
            $this->info('Import cancelled');
            return 0;
        }

        DB::beginTransaction();
        try {
            // Import permissions first
            foreach ($data['permissions'] ?? [] as $permData) {
                Permission::firstOrCreate(
                    ['name' => $permData['name']],
                    [
                        'display_name' => $permData['display_name'],
                        'module' => $permData['module'] ?? null,
                        'description' => $permData['description'] ?? null,
                    ]
                );
            }

            // Import roles and assign permissions
            foreach ($data['roles'] ?? [] as $roleData) {
                $role = Role::firstOrCreate(
                    ['name' => $roleData['name']],
                    [
                        'display_name' => $roleData['display_name'],
                        'description' => $roleData['description'] ?? null,
                    ]
                );

                if (!empty($roleData['permissions'])) {
                    $permissions = Permission::whereIn('name', $roleData['permissions'])->get();
                    $role->permissions()->sync($permissions->pluck('id'));
                }
            }

            DB::commit();

            $this->info('✓ RBAC configuration imported successfully!');
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Import failed: ' . $e->getMessage());
            return 1;
        }
    }
}
