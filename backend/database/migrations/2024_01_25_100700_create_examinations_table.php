<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examinations', function (Blueprint $table) {
            $table->id();
            $table->string('exam_code', 50)->unique();
            $table->foreignId('profession_id')->constrained()->onDelete('restrict');
            $table->string('exam_title');
            $table->text('description')->nullable();
            $table->integer('duration_minutes');
            $table->integer('total_marks');
            $table->integer('passing_marks');
            $table->date('exam_date');
            $table->time('start_time');
            $table->string('exam_center')->nullable();
            $table->string('exam_location')->nullable();
            $table->foreignId('supervisor_id')->nullable()->constrained('users');
            $table->integer('max_candidates')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['profession_id', 'exam_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examinations');
    }
};
