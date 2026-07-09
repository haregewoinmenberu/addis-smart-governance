<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_idea_id')->constrained()->onDelete('cascade');
            $table->foreignId('evaluated_by')->constrained('users')->onDelete('cascade');
            $table->integer('strategic_alignment_score')->default(0);
            $table->text('strategic_alignment_comment')->nullable();
            $table->integer('feasibility_score')->default(0);
            $table->text('feasibility_comment')->nullable();
            $table->integer('governance_impact_score')->default(0);
            $table->text('governance_impact_comment')->nullable();
            $table->integer('resource_requirement_score')->default(0);
            $table->text('resource_requirement_comment')->nullable();
            $table->integer('innovation_level_score')->default(0);
            $table->text('innovation_level_comment')->nullable();
            $table->integer('risk_level_score')->default(0);
            $table->text('risk_level_comment')->nullable();
            $table->integer('total_score')->default(0);
            $table->string('calculated_priority');
            $table->string('decision')->default('pending');
            $table->text('overall_comment')->nullable();
            $table->timestamps();

            $table->index('research_idea_id', 'rs_idea_idx');
            $table->index('evaluated_by', 'rs_evaluator_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_screenings');
    }
};
