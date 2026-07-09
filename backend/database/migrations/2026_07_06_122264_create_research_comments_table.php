<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_comments', function (Blueprint $table) {
            $table->id();
            $table->morphs('commentable'); // research_project, experiment, milestone, etc.
            $table->text('comment');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('research_comments')->onDelete('cascade');
            $table->timestamps();

            $table->index(['commentable_type', 'commentable_id'], 'rc_commentable_idx');
            $table->index('user_id', 'rc_user_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_comments');
    }
};
