<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * SmartCityServiceManagementController already validates and assigns
     * 'on_hold'/'processing' as valid statuses, but the DB enum never
     * included them — any code path hitting those values would throw a SQL
     * error. This completes the enum to match the intended behavior.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE service_form_submissions MODIFY status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed', 'on_hold', 'processing') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE service_form_submissions MODIFY status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'pending'");
    }
};
