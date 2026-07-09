<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained()->onDelete('cascade');
            $table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade');
            $table->foreignId('candidate_id')->constrained('users')->onDelete('cascade');
            $table->integer('attempt_number')->default(1);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->integer('score')->nullable();
            $table->integer('total_marks');
            $table->integer('passing_marks');
            $table->string('result', 50)->nullable(); // pass, fail, retake, appeal
            $table->foreignId('evaluator_id')->nullable()->constrained('users');
            $table->text('evaluator_comments')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            $table->boolean('is_appeal')->default(false);
            $table->text('appeal_reason')->nullable();
            $table->timestamps();
            
            $table->index(['candidate_id', 'examination_id']);
            $table->index('result');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};
