<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposal_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->integer('version_number');
            $table->text('background');
            $table->text('objectives');
            $table->text('methodology');
            $table->text('expected_deliverables');
            $table->decimal('estimated_budget', 15, 2);
            $table->text('required_resources');
            $table->string('timeline');
            $table->text('risk_analysis');
            $table->text('success_metrics');
            $table->text('change_summary')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            $table->index(['research_project_id', 'version_number'], 'pv_project_version_idx');
            $table->index('is_current', 'pv_is_current_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_versions');
    }
};
