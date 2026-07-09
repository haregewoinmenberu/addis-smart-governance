<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->foreignId('research_task_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('log_date');
            $table->decimal('hours', 5, 2);
            $table->text('description')->nullable();
            $table->string('activity_type')->nullable(); // research, development, testing, documentation
            $table->timestamps();

            $table->index(['research_project_id', 'log_date'], 'rtl_project_date_idx');
            $table->index('user_id', 'rtl_user_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_time_logs');
    }
};
