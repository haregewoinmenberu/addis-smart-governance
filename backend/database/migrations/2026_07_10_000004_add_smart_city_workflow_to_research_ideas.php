<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add Smart City Command Center workflow to research ideas
     */
    public function up(): void
    {
        Schema::table('research_ideas', function (Blueprint $table) {
            // Smart City Command Center assignment
            $table->foreignId('assigned_to_smart_city')->nullable()->after('submitted_by')->constrained('users')->onDelete('set null')->comment('Smart City Command Center user');
            $table->timestamp('smart_city_assigned_at')->nullable()->after('submitted_at');
            $table->text('smart_city_notes')->nullable();
            
            // Assignment to Research Director
            $table->foreignId('assigned_to_director')->nullable()->after('assigned_to_smart_city')->constrained('users')->onDelete('set null')->comment('Research Director user');
            $table->timestamp('director_assigned_at')->nullable();
            $table->text('director_notes')->nullable();
            
            // Assignment tracking
            $table->string('assignment_status')->default('pending_smart_city')->comment('pending_smart_city, assigned_to_director, in_research_review');
            
            $table->index('assigned_to_smart_city');
            $table->index('assigned_to_director');
            $table->index('assignment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_ideas', function (Blueprint $table) {
            $table->dropForeign(['assigned_to_smart_city']);
            $table->dropForeign(['assigned_to_director']);
            $table->dropColumn([
                'assigned_to_smart_city',
                'smart_city_assigned_at',
                'smart_city_notes',
                'assigned_to_director',
                'director_assigned_at',
                'director_notes',
                'assignment_status',
            ]);
        });
    }
};
