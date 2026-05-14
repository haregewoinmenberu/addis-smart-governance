<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RestartCommand extends Command
{
    protected $signature = 'restart';
    protected $description = 'Run migrate:fresh, db:seed, passport:client, passport:key, and optimize:clear';

    public function handle()
    {
        $this->call('migrate:fresh');
        $this->call('db:seed');
        
        // Ensure Passport keys exist
        $this->info('Generating Passport encryption keys...');
        $this->call('passport:keys', [
            '--force' => true
        ]);
        
        // Clear all caches
        $this->call('optimize:clear');
        
        $this->newLine();
        $this->info('✓ Restart sequence completed successfully!');
        $this->newLine();
        $this->info('Default users created:');
        $this->info('  • ITDB Admin: admin@itdb.gov.et / password123');
        $this->info('  • Sub-City Admin: subcity@addis.gov.et / password123');
        $this->info('  • Auditor: auditor@itdb.gov.et / password123');
        $this->newLine();
        $this->comment('Note: Run "php artisan passport:install" manually if you need OAuth clients.');
    }
}
