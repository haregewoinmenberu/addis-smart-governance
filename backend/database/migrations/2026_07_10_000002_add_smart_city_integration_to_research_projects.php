<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->foreignId('smart_city_request_id')
                ->nullable()
                ->after('research_idea_id')
                ->constrained('smart_city_requests')
                ->onDelete('set null')
                ->comment('Link to Smart City Command Center request');
            
            $table->foreignId('research_director_id')
                ->nullable()
                ->after('project_lead_id')
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Research Director overseeing this project');
            
            $table->boolean('approved_by_director')->default(false);
            $table->timestamp('director_approved_at')->nullable();
            $table->boolean('approved_by_committee')->default(false);
            $table->timestamp('committee_approved_at')->nullable();
            $table->text('director_notes')->nullable();
            $table->text('committee_notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->dropForeign(['smart_city_request_id']);
            $table->dropForeign(['research_director_id']);
            $table->dropColumn([
                'smart_city_request_id',
                'research_director_id',
                'approved_by_director',
                'director_approved_at',
                'approved_by_committee',
                'committee_approved_at',
                'director_notes',
                'committee_notes',
            ]);
        });
    }
};
