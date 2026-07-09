<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hearings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('disciplinary_cases')->onDelete('cascade');
            $table->string('hearing_type'); // preliminary, formal, appeal
            
            // Scheduling
            $table->dateTime('scheduled_at');
            $table->string('location')->nullable();
            $table->string('meeting_link')->nullable(); // For virtual hearings
            $table->integer('duration_minutes')->default(120);
            
            // Participants
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->json('committee_members');
            $table->string('professional_representative')->nullable();
            $table->json('witnesses')->nullable();
            
            // Hearing Details
            $table->string('status', 50)->default('scheduled'); // scheduled, in_progress, completed, postponed, cancelled
            $table->text('agenda')->nullable();
            $table->text('minutes')->nullable();
            $table->json('documents')->nullable();
            $table->json('evidence_presented')->nullable();
            
            // Outcome
            $table->text('decision')->nullable();
            $table->json('recommendations')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['case_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hearings');
    }
};
