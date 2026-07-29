<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_request_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained('service_form_submissions')->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->constrained('users')->onDelete('cascade');
            $table->enum('assignment_type', ['team_leader', 'officer'])->default('team_leader');
            $table->text('assignment_notes')->nullable();
            $table->timestamp('assigned_date');
            $table->timestamp('accepted_date')->nullable();
            $table->timestamp('completed_date')->nullable();
            $table->enum('status', ['pending', 'accepted', 'in_progress', 'completed', 'rejected'])->default('pending');
            $table->timestamps();

            $table->index(
                ['service_request_id', 'assignment_type'],
                'idx_sr_req_type'
            );

            $table->index(
                ['assigned_to', 'status'],
                'idx_assign_status'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_request_assignments');
    }
};
