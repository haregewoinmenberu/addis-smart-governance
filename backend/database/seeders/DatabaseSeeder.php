<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([ 
            // Research Sector
            ResearchPermissionSeeder::class,
            DashboardPermissionSeeder::class,
            InstitutionRolePermissionSeeder::class,
            DefaultUsersSeeder::class,
            ProfessionalLicensingPermissionSeeder::class,
            RolesAndPermissionsSeeder::class,
            TechnologyTransferPermissionSeeder::class,
            
            DefaultUsersSeeder::class,
            ResearchUserSeeder::class,
            
            ProfessionalLicensingDemoSeeder::class,
            ResearchDemoDataSeeder::class,
            // ResearchPermissionSeeder::class,
            TechnologyTransferDemoSeeder::class,    


            systemSettingsSeeder::class,
            NotificationSeeder::class,

            WorkflowDefinitionSeeder::class,
            WorkflowDefinitionsSeeder::class,            
            // Add other seeders as needed
        ]);
    }
}
