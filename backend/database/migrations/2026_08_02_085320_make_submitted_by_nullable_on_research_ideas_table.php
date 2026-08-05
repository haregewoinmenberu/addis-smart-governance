<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * submitted_by must become nullable to support external/guest technology
     * requests (is_external_request=true). Raw SQL is used instead of
     * Blueprint::change() because doctrine/dbal isn't installed. onDelete
     * switches cascade -> set null: deleting a user should detach their
     * historical requests, not delete the requests themselves.
     */
    public function up(): void
    {
        Schema::table('research_ideas', function ($table) {
            $table->dropForeign('research_ideas_submitted_by_foreign');
        });

        DB::statement('ALTER TABLE research_ideas MODIFY submitted_by BIGINT UNSIGNED NULL');

        Schema::table('research_ideas', function ($table) {
            $table->foreign('submitted_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_ideas', function ($table) {
            $table->dropForeign('research_ideas_submitted_by_foreign');
        });

        DB::statement('ALTER TABLE research_ideas MODIFY submitted_by BIGINT UNSIGNED NOT NULL');

        Schema::table('research_ideas', function ($table) {
            $table->foreign('submitted_by')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
