<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_workflow_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->string('from_stage')->nullable();
            $table->string('to_stage');
            $table->text('reason')->nullable();
            $table->text('comments')->nullable();
            $table->foreignId('transitioned_by')->constrained('users');
            $table->timestamp('transitioned_at');
            $table->timestamps();
            
            $table->index(['technology_request_id', 'transitioned_at'], 'tech_workflow_req_time_idx');
        });

        Schema::create('technology_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->string('document_type');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type');
            $table->integer('file_size');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('technology_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->string('version_number');
            $table->text('changes')->nullable();
            $table->text('data_snapshot')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            $table->index(['technology_request_id', 'version_number'], 'tech_ver_req_ver_idx');
        });

        Schema::create('technology_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade');
            $table->text('comment');
            $table->string('comment_type')->default('general');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technology_comments');
        Schema::dropIfExists('technology_versions');
        Schema::dropIfExists('technology_documents');
        Schema::dropIfExists('technology_workflow_history');
    }
};
