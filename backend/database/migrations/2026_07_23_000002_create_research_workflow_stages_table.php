<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Configurable workflow stages for research governance
     */
    public function up(): void
    {
        Schema::create('research_workflow_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Research Planning, Literature Review, etc.
            $table->string('slug')->unique(); // research_planning, literature_review
            $table->text('description')->nullable();
            $table->integer('order')->default(0); // Display order
            $table->boolean('is_required')->default(true);
            $table->boolean('requires_approval')->default(false); // Does this stage need approval?
            $table->foreignId('assigned_director_id')->nullable()->constrained('users')->onDelete('set null');
            $table->json('assigned_team__leaders_id')->nullable(); // Array of user IDs for team leaders assigned to this stage
            $table->json('form_fields')->nullable(); // Dynamic form schema for this stage
            $table->boolean('is_active')->default(true);
            $table->enum('research_type', ['system_request', 'infrastructure_request', 'security_related_request', 'all'])->default('all'); // Type of research this stage applies to
            $table->json('assigned_officers_id')->nullable();
            $table->timestamps();

            $table->index('order', 'rws_order_idx');
            $table->index('is_active', 'rws_active_idx'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_workflow_stages');
    }
};
