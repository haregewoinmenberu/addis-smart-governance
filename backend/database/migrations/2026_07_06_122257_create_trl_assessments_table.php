<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trl_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->integer('trl_level');
            $table->integer('previous_trl_level')->nullable();
            $table->text('assessment_notes');
            $table->text('evidence')->nullable();
            $table->text('next_level_requirements')->nullable();
            $table->foreignId('assessed_by')->constrained('users')->onDelete('cascade');
            $table->date('assessment_date');
            $table->timestamps();

            $table->index(['research_project_id', 'trl_level'], 'trl_project_level_idx');
            $table->index('assessment_date', 'trl_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trl_assessments');
    }
};
