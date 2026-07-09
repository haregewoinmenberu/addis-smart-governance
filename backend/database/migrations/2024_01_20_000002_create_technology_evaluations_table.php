<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->string('evaluation_type');
            $table->foreignId('evaluator_id')->constrained('users');
            $table->string('status')->default('pending');
            $table->integer('score')->nullable();
            $table->string('risk_level')->nullable();
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['technology_request_id', 'evaluation_type'], 'tech_eval_req_type_idx');
            $table->index(['evaluator_id', 'status'], 'tech_eval_user_status_idx');
        });

        Schema::create('evaluation_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_evaluation_id')->constrained('technology_evaluations')->onDelete('cascade');
            $table->string('item');
            $table->boolean('checked')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_checklists');
        Schema::dropIfExists('technology_evaluations');
    }
};
