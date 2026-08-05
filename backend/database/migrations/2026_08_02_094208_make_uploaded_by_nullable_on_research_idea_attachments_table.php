<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * uploaded_by must become nullable for attachments on external/guest
     * technology requests, which have no authenticated uploader. Raw SQL
     * because doctrine/dbal isn't installed (same as the submitted_by fix).
     */
    public function up(): void
    {
        Schema::table('research_idea_attachments', function ($table) {
            $table->dropForeign('research_idea_attachments_uploaded_by_foreign');
        });

        DB::statement('ALTER TABLE research_idea_attachments MODIFY uploaded_by BIGINT UNSIGNED NULL');

        Schema::table('research_idea_attachments', function ($table) {
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_idea_attachments', function ($table) {
            $table->dropForeign('research_idea_attachments_uploaded_by_foreign');
        });

        DB::statement('ALTER TABLE research_idea_attachments MODIFY uploaded_by BIGINT UNSIGNED NOT NULL');

        Schema::table('research_idea_attachments', function ($table) {
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
