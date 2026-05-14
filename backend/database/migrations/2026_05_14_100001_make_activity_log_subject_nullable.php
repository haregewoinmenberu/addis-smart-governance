<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE activity_logs MODIFY subject_type VARCHAR(255) NULL');
        DB::statement('ALTER TABLE activity_logs MODIFY subject_id BIGINT UNSIGNED NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep nullable to avoid rollback failures if nulls exist.
    }
};
