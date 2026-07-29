<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tracks assignment of research from Director → Team Leader → Officers
     */
    public function up(): void
    {
        Schema::create('research_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_idea_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->constrained('users')->onDelete('cascade');
            $table->string('assignment_type')->comment('team_leader, officer, reviewer');
            $table->text('assignment_notes')->nullable();
            $table->timestamp('assigned_date');
            $table->timestamp('accepted_date')->nullable();
            $table->timestamp('completed_date')->nullable();
            $table->string('status')->default('pending')->comment('pending, accepted, in_progress, completed, rejected');
            $table->timestamps();

            $table->index(['research_idea_id', 'assigned_to'], 'ra_research_assignee_idx');
            $table->index('assigned_by', 'ra_assigner_idx');
            $table->index('status', 'ra_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_assignments');
    }
};
