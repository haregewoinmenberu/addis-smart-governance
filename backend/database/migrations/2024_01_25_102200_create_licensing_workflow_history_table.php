<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('licensing_workflow_history', function (Blueprint $table) {
            $table->id();
            $table->morphs('entity'); // application, license, complaint, case, etc.
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            
            // Transition Details
            $table->string('from_stage')->nullable();
            $table->string('to_stage');
            $table->string('action'); // submitted, approved, rejected, verified, etc.
            $table->text('comments')->nullable();
            $table->json('metadata')->nullable();
            
            // Audit Information
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('licensing_workflow_history');
    }
};
