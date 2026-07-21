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
            // // Research Sector
            InstitutionRolePermissionSeeder::class,
            DefaultUsersSeeder::class,
            RolesAndPermissionsSeeder::class,
            
            DefaultUsersSeeder::class,
            
            ProfessionalLicensingDemoSeeder::class,
            ResearchDemoDataSeeder::class,
            // ResearchPermissionSeeder::class,

            systemSettingsSeeder::class,
            NotificationSeeder::class,
 
        ]);
    }
}
