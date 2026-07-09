<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade');
            $table->string('verification_type'); // identity, education, experience, certificate, background, professional_history
            $table->string('verifier_organization')->nullable();
            $table->foreignId('verifier_id')->nullable()->constrained('users');
            $table->string('status', 50)->default('pending');
            $table->text('verification_details')->nullable();
            $table->text('comments')->nullable();
            $table->json('evidence')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['application_id', 'verification_type']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_requests');
    }
};
