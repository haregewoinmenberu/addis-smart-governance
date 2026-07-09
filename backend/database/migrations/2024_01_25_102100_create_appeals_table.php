<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appeals', function (Blueprint $table) {
            $table->id();
            $table->string('appeal_number', 50)->unique();
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->morphs('appealable'); // Can be disciplinary_action, license_revocation, exam_result, etc.
            
            // Appeal Details
            $table->text('grounds_for_appeal');
            $table->text('arguments');
            $table->json('supporting_documents')->nullable();
            $table->json('witnesses')->nullable();
            $table->date('filed_date');
            $table->date('deadline_date');
            
            // Review
            $table->string('status', 50)->default('pending'); // pending, under_review, hearing_scheduled, decided
            $table->json('appeal_board_members')->nullable();
            $table->foreignId('assigned_reviewer')->nullable()->constrained('users');
            $table->timestamp('review_started_at')->nullable();
            
            // Hearing
            $table->dateTime('hearing_date')->nullable();
            $table->string('hearing_location')->nullable();
            $table->text('hearing_minutes')->nullable();
            
            // Decision
            $table->string('decision', 50)->nullable(); // upheld, overturned, modified, dismissed
            $table->text('decision_rationale')->nullable();
            $table->json('new_terms')->nullable();
            $table->timestamp('decision_date')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users');
            
            // Further Appeal
            $table->boolean('further_appeal_allowed')->default(false);
            $table->string('further_appeal_authority')->nullable();
            
            $table->timestamps();
            
            $table->index('appeal_number');
            $table->index('professional_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appeals');
    }
};
