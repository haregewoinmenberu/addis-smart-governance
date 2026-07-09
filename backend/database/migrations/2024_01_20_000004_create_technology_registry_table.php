<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_registry', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->string('registry_number')->unique();
            $table->string('license_type');
            $table->date('license_expiration')->nullable();
            $table->string('approval_certificate')->nullable();
            $table->unsignedBigInteger('owner_department_id')->nullable();
            $table->string('government_sector')->nullable();
            $table->string('compliance_status')->default('compliant');
            $table->string('version')->nullable();
            $table->string('support_contact');
            $table->text('maintenance_schedule')->nullable();
            $table->text('deployment_guide')->nullable();
            $table->string('technology_status')->default('active');
            $table->timestamp('registered_at');
            $table->foreignId('registered_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('registry_number');
            $table->index(['technology_status', 'compliance_status'], 'tech_reg_status_idx');
        });

        Schema::create('technology_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade');
            $table->string('license_key')->nullable();
            $table->string('license_file')->nullable();
            $table->date('issue_date');
            $table->date('expiration_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('terms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technology_licenses');
        Schema::dropIfExists('technology_registry');
    }
};
