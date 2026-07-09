<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('type'); // bug, impediment, question, enhancement
            $table->string('priority')->default('medium');
            $table->string('status')->default('open');
            $table->text('resolution')->nullable();
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('reported_date');
            $table->date('resolved_date')->nullable();
            $table->timestamps();

            $table->index('research_project_id', 'ri_project_idx');
            $table->index(['status', 'priority'], 'ri_status_priority_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_issues');
    }
};
