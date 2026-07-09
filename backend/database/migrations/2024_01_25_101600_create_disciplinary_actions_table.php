<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disciplinary_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('disciplinary_cases')->onDelete('cascade');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('license_id')->nullable()->constrained()->onDelete('set null');
            
            // Action Details
            $table->string('action_type'); // warning, fine, training, suspension, restriction, revocation
            $table->text('action_description');
            $table->integer('severity_level')->default(1); // 1-6
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_permanent')->default(false);
            
            // Specific Action Details
            $table->decimal('fine_amount', 10, 2)->nullable();
            $table->string('fine_currency', 10)->default('ETB');
            $table->boolean('fine_paid')->default(false);
            $table->timestamp('fine_paid_at')->nullable();
            
            $table->string('training_course')->nullable();
            $table->integer('training_hours')->nullable();
            $table->boolean('training_completed')->default(false);
            $table->timestamp('training_completed_at')->nullable();
            
            $table->text('practice_restrictions')->nullable();
            $table->text('suspension_terms')->nullable();
            
            // Implementation
            $table->foreignId('imposed_by')->constrained('users');
            $table->text('imposed_by_authority')->nullable();
            $table->string('status', 50)->default('pending'); // pending, active, completed, revoked
            $table->timestamp('implemented_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // Public Record
            $table->boolean('is_public')->default(true);
            $table->text('public_notice')->nullable();
            
            $table->timestamps();
            
            $table->index(['professional_id', 'action_type']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplinary_actions');
    }
};
