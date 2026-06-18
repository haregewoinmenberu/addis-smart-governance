<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_form_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('service_type'); // research, transformation, licensing, lms
            $table->string('reference_number')->unique();
            $table->json('form_data');
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->string('submitted_email')->nullable();
            $table->string('submitted_name')->nullable();
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected', 'completed'])->default('pending');
            $table->text('review_notes')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('submission_timestamp')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('submitted_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            
            $table->index('service_type');
            $table->index('reference_number');
            $table->index('status');
            $table->index('submitted_email');
            $table->index('submission_timestamp');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_form_submissions');
    }
};
