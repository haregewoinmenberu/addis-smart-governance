<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposal_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->foreignId('proposal_version_id')->nullable()->constrained()->onDelete('set null');
            $table->string('review_type'); // technical, financial, governance, final
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->string('decision');
            $table->text('comment')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();

            $table->index(['research_project_id', 'review_type'], 'pr_project_review_type_idx');
            $table->index('reviewer_id', 'pr_reviewer_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_reviews');
    }
};
