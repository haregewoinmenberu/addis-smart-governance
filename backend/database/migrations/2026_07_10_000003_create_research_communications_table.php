<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Communication tracking between research roles
     */
    public function up(): void
    {
        Schema::create('research_communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('communication_type'); // request, update, approval, feedback, report
            $table->foreignId('from_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('to_user_id')->constrained('users')->onDelete('cascade');
            $table->string('from_role'); // smart_city_command, research_director, research_lead, etc.
            $table->string('to_role');
            $table->string('subject');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // $table->index(['research_project_id', 'communication_type']);
            $table->index( ['research_project_id', 'communication_type'], 'rp_comm_idx' );
            $table->index(['to_user_id', 'is_read']);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_communications');
    }
};
