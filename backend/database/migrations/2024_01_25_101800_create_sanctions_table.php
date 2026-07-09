<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sanctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disciplinary_action_id')->constrained()->onDelete('cascade');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('license_id')->nullable()->constrained()->onDelete('set null');
            
            // Sanction Details
            $table->string('sanction_type'); // suspension, revocation, restriction
            $table->text('sanction_details');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_indefinite')->default(false);
            
            // Terms and Conditions
            $table->text('terms_and_conditions')->nullable();
            $table->text('reinstatement_conditions')->nullable();
            $table->decimal('reinstatement_fee', 10, 2)->nullable();
            
            // Status
            $table->string('status', 50)->default('active'); // active, lifted, completed
            $table->timestamp('lifted_at')->nullable();
            $table->foreignId('lifted_by')->nullable()->constrained('users');
            $table->text('lift_reason')->nullable();
            
            // Public Record
            $table->boolean('is_public_record')->default(true);
            $table->date('public_notice_date')->nullable();
            
            $table->timestamps();
            
            $table->index(['professional_id', 'status']);
            $table->index('sanction_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sanctions');
    }
};
