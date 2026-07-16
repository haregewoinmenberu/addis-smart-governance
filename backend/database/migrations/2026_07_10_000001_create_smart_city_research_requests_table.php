<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Smart City Command Center → Research Director communication
     */
    public function up(): void
    {
        Schema::create('smart_city_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code')->unique();
            $table->string('title');
            $table->text('description');
            $table->text('problem_context');
            $table->string('requesting_sector'); // e.g., 'transportation', 'health', 'energy'
            $table->string('priority')->default('medium');
            $table->string('status')->default('pending'); // pending, assigned, in_progress, completed, delivered
            $table->foreignId('requested_by')->constrained('users')->comment('Smart City Command Center User');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->comment('Research Director');
            $table->foreignId('research_project_id')->nullable()->constrained('research_projects')->onDelete('set null');
            $table->date('requested_date');
            $table->date('expected_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();
            $table->text('outcome_summary')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('requesting_sector');
            // $table->index(['requested_date', 'expected_delivery_date']);
            $table->index( ['requested_date', 'expected_delivery_date'], 'scrr_req_exp_idx' );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('smart_city_requests');
    }
};
