<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop old workflow table if exists
        Schema::dropIfExists('workflows');

        // Workflow definitions table
        Schema::create('workflow_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('entity_type'); // e.g., 'request_item', 'vendor', 'technology'
            $table->json('stages'); // Array of stage definitions
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Workflow instances (actual workflow executions)
        Schema::create('workflow_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_definition_id')->constrained()->onDelete('cascade');
            $table->morphs('workflowable'); // Polymorphic relation to any entity
            $table->string('current_stage');
            $table->integer('current_stage_index')->default(0);
            $table->string('status'); // pending, in_progress, approved, rejected, revision_requested
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // Workflow approvals (individual approval actions)
        Schema::create('workflow_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_instance_id')->constrained()->onDelete('cascade');
            $table->string('stage_name');
            $table->integer('stage_index');
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // approved, rejected, revision_requested, pending
            $table->text('comments')->nullable();
            $table->json('metadata')->nullable(); // Additional data like risk scores, etc.
            $table->timestamp('actioned_at')->nullable();
            $table->timestamps();
        });

        // Update request_items table for workflow integration
        Schema::table('request_items', function (Blueprint $table) {
            $table->foreignId('workflow_instance_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('submitted_by')->nullable()->after('workflow_instance_id')->constrained('users')->nullOnDelete();
            $table->string('category')->nullable()->after('title');
            $table->text('justification')->nullable()->after('description');
            $table->json('documents')->nullable()->after('justification');
            $table->decimal('estimated_budget', 15, 2)->nullable()->change();
            $table->string('approval_status')->default('draft')->after('status');
        });

        // Duplication analysis results
        Schema::table('duplication_cases', function (Blueprint $table) {
            $table->foreignId('request_item_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('existing_technology_id')->nullable()->after('request_item_id')->constrained('technologies')->nullOnDelete();
            $table->decimal('similarity_score', 5, 2)->nullable()->after('existing_technology_id');
            $table->string('recommendation')->nullable()->after('similarity_score'); // reuse, extend, new
            $table->text('analysis_notes')->nullable()->after('recommendation');
            $table->foreignId('analyzed_by')->nullable()->after('analysis_notes')->constrained('users')->nullOnDelete();
        });

        // Feasibility studies
        Schema::table('feasibility_studies', function (Blueprint $table) {
            $table->foreignId('request_item_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->decimal('technical_score', 5, 2)->nullable()->after('request_item_id');
            $table->decimal('financial_score', 5, 2)->nullable()->after('technical_score');
            $table->decimal('security_score', 5, 2)->nullable()->after('financial_score');
            $table->decimal('infrastructure_score', 5, 2)->nullable()->after('security_score');
            $table->decimal('integration_score', 5, 2)->nullable()->after('infrastructure_score');
            $table->decimal('sustainability_score', 5, 2)->nullable()->after('integration_score');
            $table->decimal('overall_risk_score', 5, 2)->nullable()->after('sustainability_score');
            $table->text('recommendation')->nullable()->after('overall_risk_score');
            $table->foreignId('evaluated_by')->nullable()->after('recommendation')->constrained('users')->nullOnDelete();
            $table->timestamp('evaluated_at')->nullable()->after('evaluated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feasibility_studies', function (Blueprint $table) {
            $table->dropForeign(['request_item_id']);
            $table->dropForeign(['evaluated_by']);
            $table->dropColumn([
                'request_item_id', 'technical_score', 'financial_score', 'security_score',
                'infrastructure_score', 'integration_score', 'sustainability_score',
                'overall_risk_score', 'recommendation', 'evaluated_by', 'evaluated_at'
            ]);
        });

        Schema::table('duplication_cases', function (Blueprint $table) {
            $table->dropForeign(['request_item_id']);
            $table->dropForeign(['existing_technology_id']);
            $table->dropForeign(['analyzed_by']);
            $table->dropColumn([
                'request_item_id', 'existing_technology_id', 'similarity_score',
                'recommendation', 'analysis_notes', 'analyzed_by'
            ]);
        });

        Schema::table('request_items', function (Blueprint $table) {
            $table->dropForeign(['workflow_instance_id']);
            $table->dropForeign(['submitted_by']);
            $table->dropColumn([
                'workflow_instance_id', 'submitted_by', 'category', 'justification',
                'documents', 'approval_status'
            ]);
        });

        Schema::dropIfExists('workflow_approvals');
        Schema::dropIfExists('workflow_instances');
        Schema::dropIfExists('workflow_definitions');
    }
};
