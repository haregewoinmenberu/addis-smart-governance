<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_renewals', function (Blueprint $table) {
            $table->id();
            $table->string('renewal_number', 50)->unique();
            $table->foreignId('license_id')->constrained()->onDelete('cascade');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('previous_license_id')->nullable()->constrained('licenses');
            
            // Renewal Details
            $table->date('renewal_period_start');
            $table->date('renewal_period_end');
            $table->timestamp('application_date');
            $table->string('status', 50)->default('pending'); // pending, approved, rejected
            $table->boolean('is_late_renewal')->default(false);
            $table->integer('grace_period_days')->default(0);
            
            // Requirements
            $table->integer('required_ce_hours');
            $table->integer('completed_ce_hours')->default(0);
            $table->boolean('documents_updated')->default(false);
            $table->boolean('fee_paid')->default(false);
            $table->decimal('fee_amount', 10, 2)->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamp('payment_date')->nullable();
            
            // Review
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->text('review_comments')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            $table->timestamps();
            
            $table->index('license_id');
            $table->index('professional_id');
            $table->index('status');
            $table->index('renewal_period_end');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_renewals');
    }
};
