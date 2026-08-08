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
        Schema::table('research_report_responses', function (Blueprint $table) {
            // Links to the Notification sent for this response/forward, so we
            // can tell whether the recipient has actually opened it
            // (Notification.read_at) and offer a Resend action while it's
            // still unread.
            $table->foreignId('notification_id')->nullable()->after('forwarded_to_user_id')
                ->constrained('notifications')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_report_responses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('notification_id');
        });
    }
};
