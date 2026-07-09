<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role'); // lead, researcher, engineer, data_scientist, etc.
            $table->text('responsibilities')->nullable();
            $table->date('joined_date');
            $table->date('left_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['research_project_id', 'user_id'], 'rtm_project_user_unique');
            $table->index('research_project_id', 'rtm_project_idx');
            $table->index('user_id', 'rtm_user_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_team_members');
    }
};
