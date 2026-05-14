<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\SubCity;
use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CompleteSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting complete system seeding...');

        // 1. Seed Roles and Permissions
        $this->command->info('Seeding roles and permissions...');
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Seed Workflow Definitions
        $this->command->info('Seeding workflow definitions...');
        $this->call(WorkflowDefinitionSeeder::class);

        // 3. Create ITDB Administrator
        $this->command->info('Creating ITDB Administrator...');
        $itdbAdmin = User::firstOrCreate(
            ['email' => 'admin@itdb.gov.et'],
            [
                'name' => 'ITDB Administrator',
                'password' => Hash::make('Admin@123'),
                'phone' => '+251911000001',
                'department' => 'Administration',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        
        // Ensure role is assigned
        if (!$itdbAdmin->hasRole('itdb_administrator')) {
            $itdbAdmin->assignRole('itdb_administrator');
        }
        
        $this->command->info("✓ ITDB Administrator created: {$itdbAdmin->email}");
        $this->command->info("  Roles: " . $itdbAdmin->roles->pluck('display_name')->implode(', '));

        // 4. Create ITDB Auditors
        $this->command->info('Creating ITDB Auditors...');
        $itdbAuditor1 = User::firstOrCreate(
            ['email' => 'auditor1@itdb.gov.et'],
            [
                'name' => 'ITDB Auditor - Technical',
                'password' => Hash::make('Auditor@123'),
                'phone' => '+251911000002',
                'department' => 'Technical Evaluation',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        
        if (!$itdbAuditor1->hasRole('itdb_auditor')) {
            $itdbAuditor1->assignRole('itdb_auditor');
        }

        $itdbAuditor2 = User::firstOrCreate(
            ['email' => 'auditor2@itdb.gov.et'],
            [
                'name' => 'ITDB Auditor - Financial',
                'password' => Hash::make('Auditor@123'),
                'phone' => '+251911000003',
                'department' => 'Financial Analysis',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        
        if (!$itdbAuditor2->hasRole('itdb_auditor')) {
            $itdbAuditor2->assignRole('itdb_auditor');
        }
        
        $this->command->info("✓ Created 2 ITDB Auditors");

        // 5. Create Sub-Cities
        $this->command->info('Creating sub-cities...');
        $subCities = $this->createSubCities();
        $this->command->info("✓ Created {$subCities->count()} sub-cities");

        // 6. Create Sub-City Administrators and Auditors
        $this->command->info('Creating sub-city users...');
        foreach ($subCities as $subCity) {
            $this->createSubCityUsers($subCity);
        }
        $this->command->info("✓ Created sub-city administrators and auditors");

        // 7. Create Sample Technologies
        $this->command->info('Creating sample technologies...');
        $this->createSampleTechnologies($subCities);
        $this->command->info("✓ Created sample technologies");

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('System seeding completed successfully!');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('');
        $this->command->info('ITDB Administrator:');
        $this->command->info('  Email: admin@itdb.gov.et');
        $this->command->info('  Password: Admin@123');
        $this->command->info('');
        $this->command->info('ITDB Auditor:');
        $this->command->info('  Email: auditor1@itdb.gov.et');
        $this->command->info('  Password: Auditor@123');
        $this->command->info('');
        $this->command->info('Sub-City Admin (Addis Ketema):');
        $this->command->info('  Email: admin@addisketema.gov.et');
        $this->command->info('  Password: SubCity@123');
        $this->command->info('');
    }

    /**
     * Create sub-cities.
     */
    protected function createSubCities()
    {
        $subCitiesData = [
            [
                'name' => 'Addis Ketema',
                'code' => 'AK',
                'description' => 'Addis Ketema Sub-City Administration',
                'address' => 'Addis Ketema, Addis Ababa',
                'phone' => '+251111234501',
                'email' => 'info@addisketema.gov.et',
            ],
            [
                'name' => 'Akaki Kality',
                'code' => 'AKK',
                'description' => 'Akaki Kality Sub-City Administration',
                'address' => 'Akaki Kality, Addis Ababa',
                'phone' => '+251111234502',
                'email' => 'info@akakikality.gov.et',
            ],
            [
                'name' => 'Arada',
                'code' => 'AR',
                'description' => 'Arada Sub-City Administration',
                'address' => 'Arada, Addis Ababa',
                'phone' => '+251111234503',
                'email' => 'info@arada.gov.et',
            ],
            [
                'name' => 'Bole',
                'code' => 'BO',
                'description' => 'Bole Sub-City Administration',
                'address' => 'Bole, Addis Ababa',
                'phone' => '+251111234504',
                'email' => 'info@bole.gov.et',
            ],
            [
                'name' => 'Gullele',
                'code' => 'GU',
                'description' => 'Gullele Sub-City Administration',
                'address' => 'Gullele, Addis Ababa',
                'phone' => '+251111234505',
                'email' => 'info@gullele.gov.et',
            ],
            [
                'name' => 'Kirkos',
                'code' => 'KI',
                'description' => 'Kirkos Sub-City Administration',
                'address' => 'Kirkos, Addis Ababa',
                'phone' => '+251111234506',
                'email' => 'info@kirkos.gov.et',
            ],
            [
                'name' => 'Kolfe Keranio',
                'code' => 'KK',
                'description' => 'Kolfe Keranio Sub-City Administration',
                'address' => 'Kolfe Keranio, Addis Ababa',
                'phone' => '+251111234507',
                'email' => 'info@kolfekeranio.gov.et',
            ],
            [
                'name' => 'Lideta',
                'code' => 'LI',
                'description' => 'Lideta Sub-City Administration',
                'address' => 'Lideta, Addis Ababa',
                'phone' => '+251111234508',
                'email' => 'info@lideta.gov.et',
            ],
            [
                'name' => 'Nifas Silk-Lafto',
                'code' => 'NSL',
                'description' => 'Nifas Silk-Lafto Sub-City Administration',
                'address' => 'Nifas Silk-Lafto, Addis Ababa',
                'phone' => '+251111234509',
                'email' => 'info@nifassilklafto.gov.et',
            ],
            [
                'name' => 'Yeka',
                'code' => 'YE',
                'description' => 'Yeka Sub-City Administration',
                'address' => 'Yeka, Addis Ababa',
                'phone' => '+251111234510',
                'email' => 'info@yeka.gov.et',
            ],
        ];

        $subCities = collect();
        foreach ($subCitiesData as $data) {
            $subCity = SubCity::firstOrCreate(
                ['code' => $data['code']],
                array_merge($data, [
                    'is_active' => true,
                    'activated_at' => now(),
                    'subscription_tier' => 'standard',
                ])
            );
            $subCities->push($subCity);
        }

        return $subCities;
    }

    /**
     * Create sub-city users.
     */
    protected function createSubCityUsers(SubCity $subCity)
    {
        $codeSlug = strtolower(str_replace(' ', '', $subCity->code));

        // Create Sub-City Administrator
        $admin = User::firstOrCreate(
            ['email' => "admin@{$codeSlug}.gov.et"],
            [
                'name' => "{$subCity->name} Administrator",
                'password' => Hash::make('SubCity@123'),
                'phone' => '+2519110' . str_pad($subCity->id, 5, '0', STR_PAD_LEFT),
                'sub_city_id' => $subCity->id,
                'department' => 'Administration',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        
        // Ensure role is assigned
        if (!$admin->hasRole('sub_city_admin')) {
            $admin->assignRole('sub_city_admin');
        }

        // Create Sub-City Auditor
        $auditor = User::firstOrCreate(
            ['email' => "auditor@{$codeSlug}.gov.et"],
            [
                'name' => "{$subCity->name} Auditor",
                'password' => Hash::make('SubCity@123'),
                'phone' => '+2519111' . str_pad($subCity->id, 5, '0', STR_PAD_LEFT),
                'sub_city_id' => $subCity->id,
                'department' => 'Data Collection',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        
        // Ensure role is assigned
        if (!$auditor->hasRole('sub_city_auditor')) {
            $auditor->assignRole('sub_city_auditor');
        }
    }

    /**
     * Create sample technologies.
     */
    protected function createSampleTechnologies($subCities)
    {
        $categories = ['Web Application', 'Mobile App', 'Database System', 'Network Infrastructure', 'Security System'];
        $statuses = ['active', 'inactive', 'maintenance'];
        $classifications = ['Critical', 'Important', 'Standard', 'Low Priority'];

        foreach ($subCities->take(5) as $subCity) {
            for ($i = 1; $i <= 3; $i++) {
                Technology::create([
                    'name' => "{$subCity->name} System {$i}",
                    'category' => $categories[array_rand($categories)],
                    'owner_office' => $subCity->name,
                    'status' => $statuses[array_rand($statuses)],
                    'classification' => $classifications[array_rand($classifications)],
                    'location' => "{$subCity->name} Office",
                    'deployed_at' => now()->subMonths(rand(1, 24)),
                ]);
            }
        }
    }
}
