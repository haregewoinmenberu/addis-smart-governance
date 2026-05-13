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
        Schema::create('duplication_cases', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->json('systems');
            $table->decimal('similarity_score', 5, 2);
            $table->string('status');
            $table->string('recommendation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('duplication_cases');
    }
};
