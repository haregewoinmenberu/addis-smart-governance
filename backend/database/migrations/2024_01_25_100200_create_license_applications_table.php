<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number', 50)->unique();
            $table->foreignId('applicant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('profession_id')->constrained()->onDelete('restrict');
            $table->foreignId('specialization_id')->nullable()->constrained()->onDelete('restrict');
            
            // Personal Information
            $table->string('full_name');
            $table->date('date_of_birth');
            $table->string('gender', 20);
            $table->string('national_id', 50)->unique();
            $table->string('passport_number', 50)->nullable();
            $table->string('email');
            $table->string('phone', 20);
            $table->text('address');
            $table->string('city', 100);
            $table->string('region', 100);
            $table->string('country', 100)->default('Ethiopia');
            $table->string('postal_code', 20)->nullable();
            
            // Professional Information
            $table->string('qualification_level');
            $table->string('educational_institution');
            $table->integer('graduation_year');
            $table->integer('experience_years')->default(0);
            $table->string('previous_license_number', 50)->nullable();
            $table->string('previous_license_country', 100)->nullable();
            
            // Application Status
            $table->string('status', 50)->default('draft');
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->text('review_comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('application_number');
            $table->index('national_id');
            $table->index('status');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_applications');
    }
};
