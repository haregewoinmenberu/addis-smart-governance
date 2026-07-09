<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_suspensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('license_id')->constrained()->onDelete('cascade');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('disciplinary_action_id')->nullable()->constrained()->onDelete('set null');
            
            // Suspension Details
            $table->string('suspension_type'); // temporary, pending_investigation, administrative
            $table->text('reason');
            $table->date('start_date');
            $table->date('scheduled_end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->integer('duration_days')->nullable();
            
            // Authority
            $table->foreignId('suspended_by')->constrained('users');
            $table->text('authority_info')->nullable();
            $table->text('legal_basis')->nullable();
            
            // Reinstatement
            $table->text('reinstatement_conditions')->nullable();
            $table->boolean('is_reinstated')->default(false);
            $table->timestamp('reinstated_at')->nullable();
            $table->foreignId('reinstated_by')->nullable()->constrained('users');
            $table->text('reinstatement_notes')->nullable();
            
            // Status
            $table->string('status', 50)->default('active'); // active, completed, lifted
            
            // Notifications
            $table->boolean('professional_notified')->default(false);
            $table->timestamp('notified_at')->nullable();
            $table->boolean('public_posted')->default(false);
            $table->timestamp('posted_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['license_id', 'status']);
            $table->index('professional_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_suspensions');
    }
};
