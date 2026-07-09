<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deployment_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade');
            $table->string('project_name');
            $table->string('current_phase')->default('planning');
            $table->integer('progress_percentage')->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->foreignId('project_manager_id')->constrained('users');
            $table->text('objectives')->nullable();
            $table->text('success_metrics')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            
            $table->index(['current_phase', 'status']);
        });

        Schema::create('deployment_sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deployment_project_id')->constrained('deployment_projects')->onDelete('cascade');
            $table->string('site_name');
            $table->string('location');
            $table->foreignId('site_manager_id')->nullable()->constrained('users');
            $table->string('deployment_status')->default('pending');
            $table->date('deployment_date')->nullable();
            $table->integer('users_count')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('deployment_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deployment_project_id')->constrained('deployment_projects')->onDelete('cascade');
            $table->string('report_type');
            $table->text('content');
            $table->text('issues')->nullable();
            $table->text('lessons_learned')->nullable();
            $table->text('user_feedback')->nullable();
            $table->foreignId('submitted_by')->constrained('users');
            $table->date('report_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployment_reports');
        Schema::dropIfExists('deployment_sites');
        Schema::dropIfExists('deployment_projects');
    }
};
