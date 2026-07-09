<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code')->unique();
            $table->foreignId('research_idea_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('current_stage')->default('proposal_development');
            $table->text('background')->nullable();
            $table->text('objectives')->nullable();
            $table->text('methodology')->nullable();
            $table->text('expected_deliverables')->nullable();
            $table->decimal('estimated_budget', 15, 2)->nullable();
            $table->text('required_resources')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('risk_analysis')->nullable();
            $table->text('success_metrics')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->foreignId('project_lead_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('sub_city_id')->nullable()->constrained('sub_cities')->onDelete('set null');
            $table->string('trl_level')->default('1');
            $table->timestamps();
            $table->softDeletes();

            $table->index('current_stage', 'rp_stage_idx');
            $table->index('project_lead_id', 'rp_lead_idx');
            $table->index(['start_date', 'end_date'], 'rp_dates_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_projects');
    }
};
