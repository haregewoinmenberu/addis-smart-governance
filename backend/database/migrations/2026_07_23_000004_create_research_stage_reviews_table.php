<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Reviews and approvals for workflow stages
     */
    public function up(): void
    {
        Schema::create('research_stage_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_progress_id')->constrained('research_workflow_progress')->onDelete('cascade');
            $table->foreignId('reviewed_by')->constrained('users')->onDelete('cascade');
            $table->string('decision')->comment('approved, rejected, revision_requested');
            $table->text('review_comments')->nullable();
            $table->json('review_data')->nullable(); // Additional structured review data
            $table->timestamp('reviewed_at');
            $table->timestamps();

            $table->index('workflow_progress_id', 'rsr_progress_idx');
            $table->index('reviewed_by', 'rsr_reviewer_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_stage_reviews');
    }
};
