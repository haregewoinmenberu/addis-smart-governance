<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progress_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('report_period'); // monthly, quarterly, annual
            $table->date('report_date');
            $table->text('accomplishments')->nullable();
            $table->text('challenges')->nullable();
            $table->text('next_steps')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->decimal('budget_spent', 15, 2)->nullable();
            $table->decimal('budget_remaining', 15, 2)->nullable();
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('research_project_id', 'prog_project_idx');
            $table->index('report_date', 'prog_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_reports');
    }
};
