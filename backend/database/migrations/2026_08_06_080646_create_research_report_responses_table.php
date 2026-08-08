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
        Schema::create('research_report_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_idea_id')->constrained('research_ideas')->cascadeOnDelete();
            $table->foreignId('workflow_progress_id')->constrained('research_workflow_progress')->cascadeOnDelete();
            $table->foreignId('responded_by')->constrained('users');
            // 'requester': formal decision notice back to the person who
            // submitted the request, always paired with a certificate/letter.
            // 'forward': internal handoff to another sector/director to
            // continue the process — only meaningful when the decision was
            // some form of approval, since a rejection has no next step.
            $table->enum('response_type', ['requester', 'forward']);
            $table->string('certificate_path')->nullable();
            $table->string('certificate_name')->nullable();
            $table->text('message');
            $table->foreignId('forwarded_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sent_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_report_responses');
    }
};
