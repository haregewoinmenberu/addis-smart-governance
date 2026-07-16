<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class ResearchUserSeeder extends Seeder
{
    /**
     * Seed research sector users according to Smart City hierarchy
     */
    public function run(): void
    {
        // 1. Smart City Command Center
        $smartCityCommand = User::firstOrCreate(
            ['email' => 'command@smartcity.gov'],
            [
                'name' => 'Smart City Command Center',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $smartCityCommandRole = Role::firstOrCreate(
            ['name' => 'smart_city_command'],
            ['display_name' => 'Smart City Command Center', 'description' => 'Central integration authority for Smart City']
        );
        $smartCityCommand->roles()->syncWithoutDetaching([$smartCityCommandRole->id]);
    

        $this->command->info('Research sector users created successfully:');
        $this->command->info('1. Smart City Command Center: command@smartcity.gov / password'); 
    }
}
