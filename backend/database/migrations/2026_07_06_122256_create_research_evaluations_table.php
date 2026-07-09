<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->text('baseline_metrics')->nullable();
            $table->text('performance_improvements')->nullable();
            $table->text('research_findings');
            $table->text('recommendations')->nullable();
            $table->text('lessons_learned')->nullable();
            $table->integer('trl_level');
            $table->text('trl_justification')->nullable();
            $table->text('commercialization_potential')->nullable();
            $table->text('scalability_assessment')->nullable();
            $table->text('sustainability_assessment')->nullable();
            $table->boolean('transfer_recommended')->default(false);
            $table->foreignId('evaluated_by')->constrained('users')->onDelete('cascade');
            $table->date('evaluation_date');
            $table->timestamps();

            $table->index('research_project_id', 're_project_idx');
            $table->index('trl_level', 're_trl_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_evaluations');
    }
};
