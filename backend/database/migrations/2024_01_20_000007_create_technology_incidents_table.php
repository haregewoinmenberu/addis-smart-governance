<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('incident_number')->unique();
            $table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade');
            $table->string('incident_type');
            $table->string('severity');
            $table->string('status')->default('reported');
            $table->string('title');
            $table->text('description');
            $table->text('impact')->nullable();
            $table->foreignId('reported_by')->constrained('users');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamp('reported_at');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution')->nullable();
            $table->boolean('requires_revocation')->default(false);
            $table->timestamps();
            
            $table->index(['incident_number']);
            $table->index(['severity', 'status']);
        });

        Schema::create('incident_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_incident_id')->constrained('technology_incidents')->onDelete('cascade');
            $table->string('action_type');
            $table->text('description');
            $table->foreignId('performed_by')->constrained('users');
            $table->timestamp('performed_at');
            $table->timestamps();
        });

        Schema::create('technology_revocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade');
            $table->foreignId('technology_incident_id')->nullable()->constrained('technology_incidents');
            $table->text('reason');
            $table->text('committee_decision')->nullable();
            $table->date('effective_date');
            $table->foreignId('revoked_by')->constrained('users');
            $table->text('corrective_actions')->nullable();
            $table->text('recovery_plan')->nullable();
            $table->boolean('is_permanent')->default(false);
            $table->date('review_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technology_revocations');
        Schema::dropIfExists('incident_actions');
        Schema::dropIfExists('technology_incidents');
    }
};
