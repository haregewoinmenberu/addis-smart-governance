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
        Schema::table('research_ideas', function (Blueprint $table) {
            $table->string('vendor_name')->nullable()->after('director_notes');
            $table->string('vendor_contact')->nullable()->after('vendor_name');
            $table->unsignedTinyInteger('trl_level')->nullable()->after('vendor_contact');
            $table->boolean('is_external_request')->default(false)->after('trl_level');
            $table->string('requester_name')->nullable()->after('is_external_request');
            $table->string('requester_email')->nullable()->after('requester_name');
            $table->string('requester_phone')->nullable()->after('requester_email');
            $table->string('requester_organization')->nullable()->after('requester_phone');
            // No FK constraint: smart_city_requests exists in the live DB but isn't
            // tracked by any Laravel migration, so a hard FK would break `migrate:fresh`
            // on a clean environment. Unused until Phase 2 wires intake through it.
            $table->unsignedBigInteger('smart_city_request_id')->nullable()->after('requester_organization');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_ideas', function (Blueprint $table) {
            $table->dropColumn([
                'vendor_name',
                'vendor_contact',
                'trl_level',
                'is_external_request',
                'requester_name',
                'requester_email',
                'requester_phone',
                'requester_organization',
                'smart_city_request_id',
            ]);
        });
    }
};
