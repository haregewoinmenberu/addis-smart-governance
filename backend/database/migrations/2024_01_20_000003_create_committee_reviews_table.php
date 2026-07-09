<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('committee_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->string('decision')->default('pending');
            $table->text('conditions')->nullable();
            $table->text('comments')->nullable();
            $table->text('meeting_minutes')->nullable();
            $table->string('digital_signature')->nullable();
            $table->timestamp('meeting_date')->nullable();
            $table->timestamp('decision_date')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            $table->index(['technology_request_id', 'decision'], 'committee_rev_req_dec_idx');
        });

        Schema::create('committee_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_review_id')->constrained('committee_reviews')->onDelete('cascade');
            $table->foreignId('committee_member_id')->constrained('users');
            $table->string('vote');
            $table->text('comments')->nullable();
            $table->timestamp('voted_at');
            $table->timestamps();
            
            $table->unique(['committee_review_id', 'committee_member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('committee_votes');
        Schema::dropIfExists('committee_reviews');
    }
};
