<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_workflow_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('from_stage');
            $table->string('to_stage');
            $table->text('transition_reason')->nullable();
            $table->foreignId('transitioned_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('transitioned_at');
            $table->timestamps();

            $table->index(['research_project_id', 'transitioned_at'], 'rwh_project_transitioned_idx');
            $table->index('to_stage', 'rwh_to_stage_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_workflow_history');
    }
};
