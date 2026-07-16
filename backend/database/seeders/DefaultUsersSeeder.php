<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create ITDB Administrator
        $itdbAdmin = User::firstOrCreate(
            ['email' => 'admin@itdb.gov.et'],
            [
                'name' => 'ITDB Administrator',
                'password' => Hash::make('password123'),
                'phone' => '+251911000000',
                'department' => 'IT Database Administration',
                'is_active' => true,
            ]
        );
        $itdbAdmin->syncRoles(['itdb_administrator']);

        // Create Sample Auditor
        $auditor = User::firstOrCreate(
            ['email' => 'auditor@itdb.gov.et'],
            [
                'name' => 'Senior Auditor',
                'password' => Hash::make('password123'),
                'phone' => '+251911000001',
                'department' => 'Audit & Compliance',
                'is_active' => true,
            ]
        );
        $auditor->syncRoles(['itdb_auditor']);

        $this->command->info('Default users created successfully!');
        $this->command->info('ITDB Admin: admin@itdb.gov.et / password123');
        $this->command->info('Auditor: auditor@itdb.gov.et / password123');
    }
}
