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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by_id')->nullable()->constrained('users')->onDelete('set null');            $table->string('title');
            $table->text('message');
            $table->string('channel');
            $table->string('type');
            $table->string('priority');
            $table->string('action_url')->nullable();
            $table->string('action_text')->nullable();
            $table->json('data')->nullable();
            $table->boolean('is_read')->default(false); 
            $table->string('recipient')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
