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
            // Nullable/set-null so the original uploader is always distinguishable
            // from whoever most recently replaced the file, without losing either
            // identity if a user account is later removed.
            $table->foreignId('edited_by')->nullable()->after('uploaded_by')
                ->constrained('users')->onDelete('set null');
            $table->timestamp('edited_at')->nullable()->after('edited_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_idea_attachments', function (Blueprint $table) {
            $table->dropForeign(['edited_by']);
            $table->dropColumn(['edited_by', 'edited_at']);
        });
    }
};
