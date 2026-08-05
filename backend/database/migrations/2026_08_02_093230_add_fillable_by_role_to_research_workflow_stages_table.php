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
        Schema::table('research_workflow_stages', function (Blueprint $table) {
            // Null = no restriction (any otherwise-eligible assignee can fill it,
            // matching current behavior). Set to restrict a stage to only one role.
            $table->string('fillable_by_role')->nullable()->after('research_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_workflow_stages', function (Blueprint $table) {
            $table->dropColumn('fillable_by_role');
        });
    }
};
