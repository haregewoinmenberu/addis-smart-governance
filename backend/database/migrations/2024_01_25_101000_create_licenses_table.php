<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('license_number', 50)->unique();
            $table->foreignId('application_id')->constrained('license_applications')->onDelete('restrict');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('profession_id')->constrained()->onDelete('restrict');
            $table->foreignId('specialization_id')->nullable()->constrained()->onDelete('restrict');
            
            // License Details
            $table->date('issue_date');
            $table->date('expiry_date');
            $table->string('status', 50)->default('active'); // active, expired, suspended, revoked
            $table->string('qr_code')->nullable();
            $table->string('digital_signature')->nullable();
            $table->string('certificate_path')->nullable();
            
            // Issuing Authority
            $table->foreignId('issued_by')->constrained('users');
            $table->text('issuing_authority_info')->nullable();
            $table->text('special_conditions')->nullable();
            $table->text('practice_restrictions')->nullable();
            
            // Status Changes
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->text('status_reason')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('license_number');
            $table->index('professional_id');
            $table->index('status');
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
