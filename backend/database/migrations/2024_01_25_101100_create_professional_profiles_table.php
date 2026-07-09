<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professional_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('current_license_id')->nullable()->constrained('licenses')->onDelete('set null');
            
            // Employment Information
            $table->string('current_employer')->nullable();
            $table->string('employment_type')->nullable(); // full_time, part_time, self_employed, unemployed
            $table->string('practice_location')->nullable();
            $table->string('practice_city')->nullable();
            $table->string('practice_region')->nullable();
            $table->text('practice_address')->nullable();
            $table->string('office_phone')->nullable();
            $table->string('office_email')->nullable();
            
            // Professional Details
            $table->json('specializations')->nullable();
            $table->string('practice_status', 50)->default('active'); // active, inactive, on_leave, restricted, suspended
            $table->integer('years_of_practice')->default(0);
            $table->decimal('compliance_score', 5, 2)->nullable();
            $table->integer('continuing_education_hours')->default(0);
            
            // Public Profile
            $table->boolean('is_public_searchable')->default(true);
            $table->text('bio')->nullable();
            $table->json('languages')->nullable();
            $table->string('photo_path')->nullable();
            
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('practice_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_profiles');
    }
};
