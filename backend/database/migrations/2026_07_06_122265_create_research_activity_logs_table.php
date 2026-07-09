<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action'); // created, updated, deleted, approved, rejected, transferred, etc.
            $table->string('entity_type'); // ResearchIdea, ResearchProject, etc.
            $table->unsignedBigInteger('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id'], 'ral_entity_idx');
            $table->index(['user_id', 'created_at'], 'ral_user_created_idx');
            $table->index('action', 'ral_action_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_activity_logs');
    }
};
