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
        Schema::create('research_ideas', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('summary');
            $table->text('problem_statement');
            $table->text('objectives');
            $table->text('expected_outcome');
            $table->string('research_category');
            $table->string('government_sector')->nullable();
            $table->string('priority')->default('medium');
            $table->string('status')->default('draft');
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'priority'], 'ri_status_priority_idx');
            $table->index('submitted_by', 'ri_submitter_idx');
            $table->index('created_at', 'ri_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_ideas');
    }
};
