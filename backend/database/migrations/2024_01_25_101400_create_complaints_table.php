<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_number', 50)->unique();
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('license_id')->nullable()->constrained()->onDelete('set null');
            
            // Complainant Information
            $table->foreignId('filed_by')->nullable()->constrained('users'); // null for anonymous
            $table->string('complainant_name')->nullable();
            $table->string('complainant_email')->nullable();
            $table->string('complainant_phone')->nullable();
            $table->boolean('is_anonymous')->default(false);
            
            // Complaint Details
            $table->string('violation_type'); // ethical, misconduct, safety, fraud, regulatory, criminal
            $table->string('severity', 50); // low, medium, high, critical
            $table->text('description');
            $table->date('incident_date')->nullable();
            $table->string('incident_location')->nullable();
            $table->json('witnesses')->nullable();
            $table->json('evidence_files')->nullable();
            
            // Status Tracking
            $table->string('status', 50)->default('received');
            $table->foreignId('assigned_investigator')->nullable()->constrained('users');
            $table->timestamp('investigation_started_at')->nullable();
            $table->timestamp('investigation_completed_at')->nullable();
            $table->text('investigation_summary')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('complaint_number');
            $table->index('professional_id');
            $table->index('status');
            $table->index('violation_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
