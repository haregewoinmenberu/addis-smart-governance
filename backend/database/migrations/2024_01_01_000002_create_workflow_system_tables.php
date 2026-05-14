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

        // Update request_items table for workflow integration (only if table exists)
        if (Schema::hasTable('request_items')) {
            Schema::table('request_items', function (Blueprint $table) {
                if (!Schema::hasColumn('request_items', 'workflow_instance_id')) {
                    $table->foreignId('workflow_instance_id')->nullable()->after('id')->constrained()->nullOnDelete();
                }
                if (!Schema::hasColumn('request_items', 'submitted_by')) {
                    $table->foreignId('submitted_by')->nullable()->after('workflow_instance_id')->constrained('users')->nullOnDelete();
                }
                if (!Schema::hasColumn('request_items', 'category')) {
                    $table->string('category')->nullable()->after('title');
                }
                if (!Schema::hasColumn('request_items', 'justification')) {
                    $table->text('justification')->nullable()->after('description');
                }
                if (!Schema::hasColumn('request_items', 'documents')) {
                    $table->json('documents')->nullable()->after('justification');
                }
                if (!Schema::hasColumn('request_items', 'approval_status')) {
                    $table->string('approval_status')->default('draft')->after('status');
                }
            });
        }

        // Duplication analysis results (only if table exists)
        if (Schema::hasTable('duplication_cases')) {
            Schema::table('duplication_cases', function (Blueprint $table) {
                if (!Schema::hasColumn('duplication_cases', 'request_item_id')) {
                    $table->foreignId('request_item_id')->nullable()->after('id')->constrained()->nullOnDelete();
                }
                if (!Schema::hasColumn('duplication_cases', 'existing_technology_id')) {
                    $table->foreignId('existing_technology_id')->nullable()->after('request_item_id')->constrained('technologies')->nullOnDelete();
                }
                if (!Schema::hasColumn('duplication_cases', 'similarity_score')) {
                    $table->decimal('similarity_score', 5, 2)->nullable()->after('existing_technology_id');
                }
                if (!Schema::hasColumn('duplication_cases', 'recommendation')) {
                    $table->string('recommendation')->nullable()->after('similarity_score'); // reuse, extend, new
                }
                if (!Schema::hasColumn('duplication_cases', 'analysis_notes')) {
                    $table->text('analysis_notes')->nullable()->after('recommendation');
                }
                if (!Schema::hasColumn('duplication_cases', 'analyzed_by')) {
                    $table->foreignId('analyzed_by')->nullable()->after('analysis_notes')->constrained('users')->nullOnDelete();
                }
            });
        }

        // Feasibility studies (only if table exists)
        if (Schema::hasTable('feasibility_studies')) {
            Schema::table('feasibility_studies', function (Blueprint $table) {
                if (!Schema::hasColumn('feasibility_studies', 'request_item_id')) {
                    $table->foreignId('request_item_id')->nullable()->after('id')->constrained()->nullOnDelete();
                }
                if (!Schema::hasColumn('feasibility_studies', 'technical_score')) {
                    $table->decimal('technical_score', 5, 2)->nullable()->after('request_item_id');
                }
                if (!Schema::hasColumn('feasibility_studies', 'financial_score')) {
                    $table->decimal('financial_score', 5, 2)->nullable()->after('technical_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'security_score')) {
                    $table->decimal('security_score', 5, 2)->nullable()->after('financial_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'infrastructure_score')) {
                    $table->decimal('infrastructure_score', 5, 2)->nullable()->after('security_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'integration_score')) {
                    $table->decimal('integration_score', 5, 2)->nullable()->after('infrastructure_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'sustainability_score')) {
                    $table->decimal('sustainability_score', 5, 2)->nullable()->after('integration_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'overall_risk_score')) {
                    $table->decimal('overall_risk_score', 5, 2)->nullable()->after('sustainability_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'recommendation')) {
                    $table->text('recommendation')->nullable()->after('overall_risk_score');
                }
                if (!Schema::hasColumn('feasibility_studies', 'evaluated_by')) {
                    $table->foreignId('evaluated_by')->nullable()->after('recommendation')->constrained('users')->nullOnDelete();
                }
                if (!Schema::hasColumn('feasibility_studies', 'evaluated_at')) {
                    $table->timestamp('evaluated_at')->nullable()->after('evaluated_by');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('feasibility_studies')) {
            Schema::table('feasibility_studies', function (Blueprint $table) {
                $columns = ['request_item_id', 'evaluated_by'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('feasibility_studies', $column)) {
                        $table->dropForeign(['feasibility_studies_' . $column . '_foreign']);
                    }
                }
                $table->dropColumn([
                    'request_item_id', 'technical_score', 'financial_score', 'security_score',
                    'infrastructure_score', 'integration_score', 'sustainability_score',
                    'overall_risk_score', 'recommendation', 'evaluated_by', 'evaluated_at'
                ]);
            });
        }

        if (Schema::hasTable('duplication_cases')) {
            Schema::table('duplication_cases', function (Blueprint $table) {
                $columns = ['request_item_id', 'existing_technology_id', 'analyzed_by'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('duplication_cases', $column)) {
                        $table->dropForeign(['duplication_cases_' . $column . '_foreign']);
                    }
                }
                $table->dropColumn([
                    'request_item_id', 'existing_technology_id', 'similarity_score',
                    'recommendation', 'analysis_notes', 'analyzed_by'
                ]);
            });
        }

        if (Schema::hasTable('request_items')) {
            Schema::table('request_items', function (Blueprint $table) {
                $columns = ['workflow_instance_id', 'submitted_by'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('request_items', $column)) {
                        $table->dropForeign(['request_items_' . $column . '_foreign']);
                    }
                }
                $table->dropColumn([
                    'workflow_instance_id', 'submitted_by', 'category', 'justification',
                    'documents', 'approval_status'
                ]);
            });
        }

        Schema::dropIfExists('workflow_approvals');
        Schema::dropIfExists('workflow_instances');
        Schema::dropIfExists('workflow_definitions');
    }
};
