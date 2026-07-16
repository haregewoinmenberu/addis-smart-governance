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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('amharic_name')->nullable();
            $table->enum('type', [
                'BUREAU',
                'AUTHORITY',
                'COMMISSION',
                'AGENCY',
                'OFFICE',
                'SUB_CITY',
                'WOREDA',
                'PUBLIC_ENTERPRISE',
                'UNIVERSITY',
                'COLLEGE',
                'TVET',
                'SCHOOL',
                'HOSPITAL',
                'HEALTH_CENTER',
                'HEALTH_OFFICE',
                'RESEARCH_INSTITUTE',
                'COURT',
                'SECURITY',
                'UTILITY',
                'NGO',
                'COOPERATIVE',
                'ASSOCIATION',
                'MANUFACTURING',
                'FINANCIAL_INSTITUTION',
                'PRIVATE_COMPANY',
                'STARTUP',
                'RELIGIOUS_INSTITUTION',
                'OTHER_GOVERNMENT',
                'OTHER'
            ]);
            $table->string('registration_number')->unique()->nullable();
            $table->string('tin_number')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('alternative_phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->default('Addis Ababa');
            $table->string('woreda')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])->default('PENDING');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('documents')->nullable(); // Store document paths
            $table->json('metadata')->nullable(); // Additional flexible data
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('type');
            $table->index('status');
            $table->index('email');
        });

        // Add institution_id to users table
        Schema::table('users', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('users', 'institution_id')) {
                $table->foreignId('institution_id')->nullable()->after('id')->constrained('institutions')->onDelete('cascade');
            }
            if (!Schema::hasColumn('users', 'user_type')) {
                $table->enum('user_type', ['INTERNAL', 'INSTITUTIONAL', 'EXTERNAL'])->default('INTERNAL')->after('institution_id');
            }
            if (!Schema::hasColumn('users', 'position')) {
                $table->string('position')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('position');
            }
        });

        // Link service form submissions to institutions
        Schema::table('service_form_submissions', function (Blueprint $table) {
            $table->foreignId('institution_id')->nullable()->after('id')->constrained('institutions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_form_submissions', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
            $table->dropColumn('institution_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
            $table->dropColumn(['institution_id', 'user_type', 'position', 'phone']);
        });

        Schema::dropIfExists('institutions');
    }
};
