<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experience_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade');
            $table->string('organization_name');
            $table->string('position');
            $table->string('location');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('responsibilities')->nullable();
            $table->string('supervisor_name')->nullable();
            $table->string('supervisor_contact')->nullable();
            $table->foreignId('document_id')->nullable()->constrained('professional_documents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_records');
    }
};
