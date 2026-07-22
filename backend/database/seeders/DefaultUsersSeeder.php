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
        $password = Hash::make('Password@123');

        $users = [

            // Bureau Head
            [
                'name' => 'Dr. Abraham Bekele',
                'email' => 'bureau@itdb.gov.et',
                'phone' => '+251911000001',
                'department' => 'Innovation and Technology Development Bureau',
                'role' => 'bureau_head',
            ],

            // Smart City Sector
            [
                'name' => 'Hana Tadesse',
                'email' => 'smartcity@itdb.gov.et',
                'phone' => '+251911000002',
                'department' => 'Smart City Sector',
                'role' => 'smart_city_sector_head',
            ],

            // Capacity Building Directorate
            [
                'name' => 'Solomon Alemu',
                'email' => 'training@itdb.gov.et',
                'phone' => '+251911000003',
                'department' => 'Capacity Building and Training Directorate',
                'role' => 'capacity_building_director',
            ],

            [
                'name' => 'Bethlehem Worku',
                'email' => 'trainingtl@itdb.gov.et',
                'phone' => '+251911000004',
                'department' => 'Capacity Building and Training Directorate',
                'role' => 'training_team_leader',
            ],

            [
                'name' => 'Samuel Girma',
                'email' => 'trainer1@itdb.gov.et',
                'phone' => '+251911000005',
                'department' => 'Capacity Building and Training Directorate',
                'role' => 'training_officer',
            ],


            // Research Directorate
            [
                'name' => 'Dawit Mekonnen',
                'email' => 'research@itdb.gov.et',
                'phone' => '+251911000006',
                'department' => 'Innovation and Technology Research Directorate',
                'role' => 'research_director',
            ],

            [
                'name' => 'Bethlehem Worku',
                'email' => 'researchtl@itdb.gov.et',
                'phone' => '+251911000004',
                'department' => 'Innovation and Technology Research Directorate',
                'role' => 'research_team_leader',
            ],

            [
                'name' => 'Tigist Abebe',
                'email' => 'researcher1@itdb.gov.et',
                'phone' => '+251911000007',
                'department' => 'Innovation and Technology Research Directorate',
                'role' => 'research_officer',
            ],


            // Security Directorate
            [
                'name' => 'Fitsum Tesfaye',
                'email' => 'security@itdb.gov.et',
                'phone' => '+251911000008',
                'department' => 'Information System Security Management',
                'role' => 'security_director',
            ],

            [
                'name' => 'Eden Haile',
                'email' => 'security1@itdb.gov.et',
                'phone' => '+251911000009',
                'department' => 'Information System Security Management',
                'role' => 'security_officer',
            ],


            // Development Sector
            [
                'name' => 'Meron Assefa',
                'email' => 'development@itdb.gov.et',
                'phone' => '+251911000010',
                'department' => 'Innovation and Technology Development Sector',
                'role' => 'development_sector_head',
            ],


            // Project Management
            [
                'name' => 'Yonas Tesfaye',
                'email' => 'project@itdb.gov.et',
                'phone' => '+251911000011',
                'department' => 'IT Project Management Directorate',
                'role' => 'project_director',
            ],

            [
                'name' => 'Daniel Kassa',
                'email' => 'pm1@itdb.gov.et',
                'phone' => '+251911000012',
                'department' => 'IT Project Management Directorate',
                'role' => 'project_manager',
            ],


            // Software Development
            [
                'name' => 'Ahmed Ibrahim',
                'email' => 'software@itdb.gov.et',
                'phone' => '+251911000013',
                'department' => 'Software and Platform Development Directorate',
                'role' => 'software_development_director',
            ],

            [
                'name' => 'Kalkidan Desta',
                'email' => 'devlead@itdb.gov.et',
                'phone' => '+251911000014',
                'department' => 'Software and Platform Development Directorate',
                'role' => 'software_team_leader',
            ],

            [
                'name' => 'Bereket Desta',
                'email' => 'developer1@itdb.gov.et',
                'phone' => '+251911000015',
                'department' => 'Software and Platform Development Directorate',
                'role' => 'software_developer',
            ],


            // Infrastructure
            [
                'name' => 'Habtamu Bekele',
                'email' => 'infra@itdb.gov.et',
                'phone' => '+251911000016',
                'department' => 'IT Infrastructure Development Directorate',
                'role' => 'infrastructure_director',
            ],

            [
                'name' => 'Mikiyas Hailemariam',
                'email' => 'engineer1@itdb.gov.et',
                'phone' => '+251911000017',
                'department' => 'IT Infrastructure Development Directorate',
                'role' => 'infrastructure_engineer',
            ],


            // Operation Sector
            [
                'name' => 'Selamawit Desta',
                'email' => 'operation@itdb.gov.et',
                'phone' => '+251911000018',
                'department' => 'Information Technology Operation and Service Sector',
                'role' => 'operation_sector_head',
            ],

            [
                'name' => 'Yohannes Tarekegn',
                'email' => 'maintenance@itdb.gov.et',
                'phone' => '+251911000019',
                'department' => 'IT Operation and Maintenance Directorate',
                'role' => 'maintenance_director',
            ],

            [
                'name' => 'Mohammed Ali',
                'email' => 'support1@itdb.gov.et',
                'phone' => '+251911000020',
                'department' => 'IT Operation and Maintenance Directorate',
                'role' => 'support_officer',
            ],


            // Data Center
            [
                'name' => 'Frehiwot Girma',
                'email' => 'datacenter@itdb.gov.et',
                'phone' => '+251911000021',
                'department' => 'Data Center and Cloud Directorate',
                'role' => 'data_center_director',
            ],

            [
                'name' => 'Henok Abate',
                'email' => 'cloud1@itdb.gov.et',
                'phone' => '+251911000022',
                'department' => 'Data Center and Cloud Directorate',
                'role' => 'cloud_engineer',
            ],


            // Quality Unit
            [
                'name' => 'Mulugeta Haile',
                'email' => 'quality@itdb.gov.et',
                'phone' => '+251911000023',
                'department' => 'Quality Unit',
                'role' => 'quality_director',
            ],

            [
                'name' => 'Ruth Tesfaye',
                'email' => 'quality1@itdb.gov.et',
                'phone' => '+251911000024',
                'department' => 'Quality Unit',
                'role' => 'quality_officer',
            ],

        ];


        foreach ($users as $data) {

            $user = User::firstOrCreate(
                [
                    'email' => $data['email']
                ],
                [
                    'name' => $data['name'],
                    'password' => $password,
                    'phone' => $data['phone'],
                    'department' => $data['department'],
                    'is_active' => true,
                ]
            );


            $user->syncRoles([
                $data['role']
            ]);
        }


        $this->command->info('====================================');
        $this->command->info('ITDB Demo Users Created Successfully');
        $this->command->info('Default Password: Password@123');
        $this->command->info('Total Users: ' . count($users));
        $this->command->info('====================================');
    }
}
