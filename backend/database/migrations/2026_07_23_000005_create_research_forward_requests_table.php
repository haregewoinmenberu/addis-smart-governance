<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tracks forwarding of completed research to Smart City
     */
    public function up(): void
    {
        Schema::create('research_forward_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_idea_id')->constrained()->onDelete('cascade');
            $table->foreignId('forwarded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('forwarded_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('forward_message')->nullable();
            $table->json('attachments')->nullable(); // Final report, recommendations files
            $table->json('recommendations')->nullable(); // Structured recommendations
            $table->timestamp('forwarded_at');
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('status')->default('pending')->comment('pending, acknowledged, under_review, accepted, implemented');
            $table->text('smart_city_feedback')->nullable();
            $table->timestamps();

            $table->index('research_idea_id', 'rfr_research_idx');
            $table->index('forwarded_by', 'rfr_forwarder_idx');
            $table->index('status', 'rfr_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_forward_requests');
    }
};
