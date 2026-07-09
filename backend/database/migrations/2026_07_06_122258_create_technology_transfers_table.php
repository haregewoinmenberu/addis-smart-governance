<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('transfer_code')->unique();
            $table->text('transfer_package')->nullable();
            $table->string('receiving_organization');
            $table->text('deployment_plan')->nullable();
            $table->text('training_plan')->nullable();
            $table->text('documentation')->nullable();
            $table->text('intellectual_property')->nullable();
            $table->string('commercialization_status')->default('pending');
            $table->string('deployment_status')->default('pending');
            $table->date('transfer_date')->nullable();
            $table->date('deployment_date')->nullable();
            $table->text('success_metrics')->nullable();
            $table->text('impact_assessment')->nullable();
            $table->foreignId('transferred_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('research_project_id', 'tt_project_idx');
            $table->index('commercialization_status', 'tt_commercial_idx');
            $table->index('deployment_status', 'tt_deploy_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technology_transfers');
    }
};
