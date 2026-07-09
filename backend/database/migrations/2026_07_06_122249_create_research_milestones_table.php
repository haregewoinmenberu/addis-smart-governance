<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('planned_start_date');
            $table->date('planned_end_date');
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->string('status')->default('pending');
            $table->text('deliverables')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('research_project_id', 'rm_project_idx');
            $table->index(['status', 'planned_end_date'], 'rm_status_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_milestones');
    }
};
