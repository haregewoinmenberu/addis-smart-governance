<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('category'); // technical, financial, operational, external
            $table->string('probability'); // low, medium, high
            $table->string('impact'); // low, medium, high, critical
            $table->text('mitigation_strategy')->nullable();
            $table->string('status')->default('open');
            $table->foreignId('identified_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('identified_date');
            $table->date('resolved_date')->nullable();
            $table->timestamps();

            $table->index('research_project_id', 'rr_project_idx');
            $table->index(['status', 'impact'], 'rr_status_impact_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_risks');
    }
};
