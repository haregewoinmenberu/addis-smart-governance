<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tracks progress through each workflow stage for a research idea
     */
    public function up(): void
    {
        Schema::create('research_workflow_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_idea_id')->constrained()->onDelete('cascade');
            $table->foreignId('stage_id')->constrained('research_workflow_stages')->onDelete('cascade');
            $table->string('status')->default('not_started')->comment('not_started, in_progress, pending_review, approved, revision_requested, completed');
            $table->json('stage_data')->nullable(); // Stores form data for this stage
            $table->text('notes')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['research_idea_id', 'stage_id'], 'rwp_research_stage_idx');
            $table->index('status', 'rwp_status_idx');
            $table->index('assigned_to', 'rwp_assigned_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_workflow_progress');
    }
};
