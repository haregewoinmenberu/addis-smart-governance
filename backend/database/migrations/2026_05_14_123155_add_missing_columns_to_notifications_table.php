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
        Schema::table('notifications', function (Blueprint $table) {
            // Add type column
            if (!Schema::hasColumn('notifications', 'type')) {
                $table->string('type')->after('message')->default('info');
            }
            
            // Add action columns
            if (!Schema::hasColumn('notifications', 'action_url')) {
                $table->string('action_url')->after('priority')->nullable();
            }
            if (!Schema::hasColumn('notifications', 'action_text')) {
                $table->string('action_text')->after('action_url')->nullable();
            }
            
            // Add data column for additional metadata
            if (!Schema::hasColumn('notifications', 'data')) {
                $table->json('data')->after('action_text')->nullable();
            }
            
            // Add sent_at timestamp
            if (!Schema::hasColumn('notifications', 'sent_at')) {
                $table->timestamp('sent_at')->after('data')->nullable();
            }
            
            // Drop recipient column if it exists (replaced by user_id)
            if (Schema::hasColumn('notifications', 'recipient')) {
                $table->dropColumn('recipient');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'action_url',
                'action_text',
                'data',
                'sent_at',
            ]);
            $table->string('recipient')->nullable();
        });
    }
};
