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
        // Create a personal access client for the default user (id=1)
        $this->call('passport:client', [
            '--personal' => true,
            '--user_id' => 1,
            '--name' => 'Default Personal Access Client'
        ]);
        $this->call('passport:key', [
            '--force' => true
        ]);
        $this->call('optimize:clear');
        $this->info('Restart sequence completed.');
    }
}
