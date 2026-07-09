<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prototype_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('version_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('features')->nullable();
            $table->text('improvements')->nullable();
            $table->text('known_issues')->nullable();
            $table->string('status')->default('development');
            $table->date('release_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('research_project_id', 'pv_project_idx');
            $table->index('version_number', 'pv_version_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prototype_versions');
    }
};
