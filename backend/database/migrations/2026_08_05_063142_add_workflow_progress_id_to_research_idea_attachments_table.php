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
        Schema::table('research_idea_attachments', function (Blueprint $table) {
            // Links a document uploaded through a workflow stage's dynamic form
            // back to that stage, so it can both (a) be deduplicated on
            // re-upload and (b) appear in the request's unified Documents tab,
            // which previously only saw attachments from the initial submission.
            $table->foreignId('workflow_progress_id')->nullable()
                ->after('research_idea_id')
                ->constrained('research_workflow_progress')
                ->onDelete('cascade');
            $table->string('field_name')->nullable()->after('workflow_progress_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_idea_attachments', function (Blueprint $table) {
            $table->dropForeign(['workflow_progress_id']);
            $table->dropColumn(['workflow_progress_id', 'field_name']);
        });
    }
};
