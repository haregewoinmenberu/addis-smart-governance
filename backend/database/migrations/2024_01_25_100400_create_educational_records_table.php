<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educational_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade');
            $table->string('degree_type'); // bachelor, master, phd, diploma, certificate
            $table->string('field_of_study');
            $table->string('institution_name');
            $table->string('country', 100);
            $table->integer('graduation_year');
            $table->string('grade_gpa', 50)->nullable();
            $table->foreignId('document_id')->nullable()->constrained('professional_documents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_records');
    }
};
