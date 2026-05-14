<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SetupSystemCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:setup {--fresh : Fresh installation (drops all tables)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup the complete Addis Smart Governance system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('========================================');
        $this->info('Addis Smart Governance System Setup');
        $this->info('========================================');
        $this->newLine();

        if ($this->option('fresh')) {
            if (!$this->confirm('This will drop all tables and data. Are you sure?', false)) {
                $this->error('Setup cancelled.');
                return 1;
            }

            $this->info('Running fresh migration...');
            Artisan::call('migrate:fresh', [], $this->getOutput());
            $this->info('✓ Database migrated');
        } else {
            $this->info('Running migrations...');
            Artisan::call('migrate', [], $this->getOutput());
            $this->info('✓ Database migrated');
        }

        $this->newLine();
        $this->info('Seeding system data...');
        
        // Seed complete system
        Artisan::call('db:seed', ['--class' => 'CompleteSystemSeeder'], $this->getOutput());
        
        $this->newLine();
        $this->info('✓ System setup completed successfully!');
        $this->newLine();

        $this->displayCredentials();

        return 0;
    }

    protected function displayCredentials()
    {
        $this->info('========================================');
        $this->info('Default Login Credentials');
        $this->info('========================================');
        $this->newLine();

        $this->table(
            ['Role', 'Email', 'Password'],
            [
                ['ITDB Administrator', 'admin@itdb.gov.et', 'Admin@123'],
                ['ITDB Auditor', 'auditor1@itdb.gov.et', 'Auditor@123'],
                ['Sub-City Admin (Addis Ketema)', 'admin@ak.gov.et', 'SubCity@123'],
                ['Sub-City Auditor (Addis Ketema)', 'auditor@ak.gov.et', 'SubCity@123'],
            ]
        );

        $this->newLine();
        $this->warn('⚠ Please change these passwords after first login!');
        $this->newLine();

        $this->info('System Features:');
        $this->line('  • 4 Role-based user types with strict hierarchy');
        $this->line('  • 10 Sub-cities (Addis Ababa)');
        $this->line('  • Multi-stage workflow approval system');
        $this->line('  • Automated duplication analysis');
        $this->line('  • Multi-criteria feasibility evaluation');
        $this->line('  • Comprehensive audit trail');
        $this->line('  • Multi-channel notifications');
        $this->newLine();

        $this->info('Next Steps:');
        $this->line('  1. Start the development server: php artisan serve');
        $this->line('  2. Login with ITDB Administrator credentials');
        $this->line('  3. Review system settings and configurations');
        $this->line('  4. Create additional users as needed');
        $this->newLine();
    }
}
