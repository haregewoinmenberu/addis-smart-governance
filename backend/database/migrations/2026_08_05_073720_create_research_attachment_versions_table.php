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
        Schema::create('research_attachment_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attachment_id')->constrained('research_idea_attachments')->onDelete('cascade');
            $table->integer('version_number');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->text('version_notes')->nullable();
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['attachment_id', 'version_number']);
            $table->index(['attachment_id', 'is_current']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_attachment_versions');
    }
};
