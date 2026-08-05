<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('research_ideas', function (Blueprint $table) {
            $table->string('reference_number')->nullable()->unique()->after('smart_city_request_id');
            $table->json('intake_form_data')->nullable()->after('reference_number');
        });

        // Backfill existing rows so old ideas are trackable too, matching the
        // format ResearchIdea::getClearanceCertificate() already generates.
        $ideas = DB::table('research_ideas')->whereNull('reference_number')->orderBy('id')->get(['id', 'created_at']);
        foreach ($ideas as $idea) {
            DB::table('research_ideas')->where('id', $idea->id)->update([
                'reference_number' => 'TCR-' . str_pad($idea->id, 5, '0', STR_PAD_LEFT) . '-' . date('Y', strtotime($idea->created_at)),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_ideas', function (Blueprint $table) {
            $table->dropColumn(['reference_number', 'intake_form_data']);
        });
    }
};
