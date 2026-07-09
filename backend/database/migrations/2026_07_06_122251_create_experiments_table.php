<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('experiment_code')->unique();
            $table->string('title');
            $table->text('hypothesis')->nullable();
            $table->text('methodology')->nullable();
            $table->date('conducted_date');
            $table->text('results')->nullable();
            $table->text('conclusion')->nullable();
            $table->text('observations')->nullable();
            $table->string('status')->default('planned');
            $table->foreignId('conducted_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('research_project_id', 'exp_project_idx');
            $table->index('status', 'exp_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiments');
    }
};
