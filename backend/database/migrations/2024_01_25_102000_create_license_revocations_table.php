<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_revocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('license_id')->constrained()->onDelete('cascade');
            $table->foreignId('professional_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('disciplinary_case_id')->nullable()->constrained()->onDelete('set null');
            
            // Revocation Details
            $table->string('revocation_type'); // permanent, temporary_with_reapplication, automatic
            $table->text('reason');
            $table->text('legal_basis');
            $table->date('revocation_date');
            $table->date('effective_date');
            
            // Authority and Decision
            $table->foreignId('revoked_by')->constrained('users');
            $table->text('authority_info');
            $table->text('committee_decision')->nullable();
            $table->json('committee_members')->nullable();
            $table->json('supporting_documents')->nullable();
            
            // Recovery Options
            $table->boolean('can_reapply')->default(false);
            $table->date('earliest_reapplication_date')->nullable();
            $table->text('reapplication_conditions')->nullable();
            $table->text('recovery_requirements')->nullable();
            
            // Appeal
            $table->boolean('appeal_filed')->default(false);
            $table->date('appeal_deadline')->nullable();
            $table->unsignedBigInteger('appeal_id')->nullable();
            $table->string('appeal_status', 50)->nullable();
            
            // Public Record
            $table->boolean('is_public_record')->default(true);
            $table->date('public_notice_date')->nullable();
            $table->text('public_notice_content')->nullable();
            
            // Status
            $table->string('status', 50)->default('active'); // active, appealed, upheld, overturned
            
            $table->timestamps();
            
            $table->index('license_id');
            $table->index('professional_id');
            $table->index('revocation_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_revocations');
    }
};
