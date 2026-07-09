<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disciplinary_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->foreignId('complaint_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('license_id')->nullable()->constrained()->onDelete('set null');
            
            // Case Details
            $table->string('case_type'); // complaint_based, audit_based, inspection_based
            $table->text('case_summary');
            $table->json('violations')->nullable(); // Array of violation types
            $table->string('status', 50)->default('investigating');
            
            // Investigation
            $table->foreignId('lead_investigator')->nullable()->constrained('users');
            $table->json('investigation_team')->nullable();
            $table->text('investigation_findings')->nullable();
            $table->json('evidence_collected')->nullable();
            $table->timestamp('investigation_completed_at')->nullable();
            
            // Committee Review
            $table->json('committee_members')->nullable();
            $table->timestamp('hearing_scheduled_at')->nullable();
            $table->text('hearing_minutes')->nullable();
            $table->timestamp('decision_date')->nullable();
            $table->text('committee_decision')->nullable();
            
            // Resolution
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_summary')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('case_number');
            $table->index('professional_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplinary_cases');
    }
};
