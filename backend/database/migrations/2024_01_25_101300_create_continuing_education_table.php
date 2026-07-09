<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('continuing_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('license_id')->nullable()->constrained()->onDelete('set null');
            
            // Course Details
            $table->string('course_title');
            $table->string('provider');
            $table->string('course_type'); // workshop, seminar, conference, online, certification
            $table->date('completion_date');
            $table->integer('hours')->default(0);
            $table->integer('credits')->default(0);
            $table->string('certificate_number')->nullable();
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->string('document_path')->nullable();
            
            $table->timestamps();
            
            $table->index(['professional_id', 'completion_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('continuing_education');
    }
};
