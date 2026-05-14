<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration fixes foreign key constraints and ensures consistent column naming
     * across all tables in the database.
     */
    public function up(): void
    {
        // 1. Fix users table - remove redundant sub_city string column
        Schema::table('users', function (Blueprint $table) {
            // Drop the old string column if it exists
            if (Schema::hasColumn('users', 'sub_city')) {
                $table->dropColumn('sub_city');
            }
        });

        // 2. Add foreign keys to request_items table
        Schema::table('request_items', function (Blueprint $table) {
            // Add created_by and updated_by for audit trail
            if (!Schema::hasColumn('request_items', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('request_items', 'updated_by_id')) {
                $table->foreignId('updated_by_id')->nullable()->after('created_by_id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id for multi-tenancy
            if (!Schema::hasColumn('request_items', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('updated_by_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 3. Add foreign keys to technologies table
        Schema::table('technologies', function (Blueprint $table) {
            // Add created_by and updated_by
            if (!Schema::hasColumn('technologies', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('technologies', 'updated_by_id')) {
                $table->foreignId('updated_by_id')->nullable()->after('created_by_id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id
            if (!Schema::hasColumn('technologies', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('updated_by_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 4. Add foreign keys to audits table
        Schema::table('audits', function (Blueprint $table) {
            // Add auditor_id (who is conducting the audit)
            if (!Schema::hasColumn('audits', 'auditor_id')) {
                $table->foreignId('auditor_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add created_by and updated_by
            if (!Schema::hasColumn('audits', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('auditor_id')
                    ->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('audits', 'updated_by_id')) {
                $table->foreignId('updated_by_id')->nullable()->after('created_by_id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id
            if (!Schema::hasColumn('audits', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('updated_by_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 5. Add foreign keys to vendors table
        Schema::table('vendors', function (Blueprint $table) {
            // Add created_by and updated_by
            if (!Schema::hasColumn('vendors', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('vendors', 'updated_by_id')) {
                $table->foreignId('updated_by_id')->nullable()->after('created_by_id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add approved_by
            if (!Schema::hasColumn('vendors', 'approved_by_id')) {
                $table->foreignId('approved_by_id')->nullable()->after('updated_by_id')
                    ->constrained('users')->nullOnDelete();
            }
        });

        // 6. Add foreign keys to notifications table
        Schema::table('notifications', function (Blueprint $table) {
            // Add user_id (recipient)
            if (!Schema::hasColumn('notifications', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')
                    ->constrained('users')->onDelete('cascade');
            }
            // Add created_by (sender)
            if (!Schema::hasColumn('notifications', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('user_id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id for filtering
            if (!Schema::hasColumn('notifications', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('created_by_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 7. Add foreign keys to reports table
        Schema::table('reports', function (Blueprint $table) {
            // Add created_by
            if (!Schema::hasColumn('reports', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id
            if (!Schema::hasColumn('reports', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('created_by_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 8. Add foreign keys to surveys table
        Schema::table('surveys', function (Blueprint $table) {
            // Add created_by
            if (!Schema::hasColumn('surveys', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id
            if (!Schema::hasColumn('surveys', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('created_by_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 9. Add foreign keys to cybersecurity_issues table
        Schema::table('cybersecurity_issues', function (Blueprint $table) {
            // Add reported_by
            if (!Schema::hasColumn('cybersecurity_issues', 'reported_by_id')) {
                $table->foreignId('reported_by_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add assigned_to
            if (!Schema::hasColumn('cybersecurity_issues', 'assigned_to_id')) {
                $table->foreignId('assigned_to_id')->nullable()->after('reported_by_id')
                    ->constrained('users')->nullOnDelete();
            }
            // Add sub_city_id
            if (!Schema::hasColumn('cybersecurity_issues', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()->after('assigned_to_id')
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 10. Add foreign keys to duplication_cases table
        Schema::table('duplication_cases', function (Blueprint $table) {
            // Add sub_city_id at the end since analyzed_by might not exist yet
            if (!Schema::hasColumn('duplication_cases', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });

        // 11. Add foreign keys to feasibility_studies table
        Schema::table('feasibility_studies', function (Blueprint $table) {
            // Add sub_city_id at the end since evaluated_by might not exist yet
            if (!Schema::hasColumn('feasibility_studies', 'sub_city_id')) {
                $table->foreignId('sub_city_id')->nullable()
                    ->constrained('sub_cities')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign keys in reverse order
        
        Schema::table('feasibility_studies', function (Blueprint $table) {
            if (Schema::hasColumn('feasibility_studies', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
        });

        Schema::table('duplication_cases', function (Blueprint $table) {
            if (Schema::hasColumn('duplication_cases', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
        });

        Schema::table('cybersecurity_issues', function (Blueprint $table) {
            if (Schema::hasColumn('cybersecurity_issues', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('cybersecurity_issues', 'assigned_to_id')) {
                $table->dropForeign(['assigned_to_id']);
                $table->dropColumn('assigned_to_id');
            }
            if (Schema::hasColumn('cybersecurity_issues', 'reported_by_id')) {
                $table->dropForeign(['reported_by_id']);
                $table->dropColumn('reported_by_id');
            }
        });

        Schema::table('surveys', function (Blueprint $table) {
            if (Schema::hasColumn('surveys', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('surveys', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
        });

        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('reports', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
        });

        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('notifications', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
            if (Schema::hasColumn('notifications', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });

        Schema::table('vendors', function (Blueprint $table) {
            if (Schema::hasColumn('vendors', 'approved_by_id')) {
                $table->dropForeign(['approved_by_id']);
                $table->dropColumn('approved_by_id');
            }
            if (Schema::hasColumn('vendors', 'updated_by_id')) {
                $table->dropForeign(['updated_by_id']);
                $table->dropColumn('updated_by_id');
            }
            if (Schema::hasColumn('vendors', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
        });

        Schema::table('audits', function (Blueprint $table) {
            if (Schema::hasColumn('audits', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('audits', 'updated_by_id')) {
                $table->dropForeign(['updated_by_id']);
                $table->dropColumn('updated_by_id');
            }
            if (Schema::hasColumn('audits', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
            if (Schema::hasColumn('audits', 'auditor_id')) {
                $table->dropForeign(['auditor_id']);
                $table->dropColumn('auditor_id');
            }
        });

        Schema::table('technologies', function (Blueprint $table) {
            if (Schema::hasColumn('technologies', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('technologies', 'updated_by_id')) {
                $table->dropForeign(['updated_by_id']);
                $table->dropColumn('updated_by_id');
            }
            if (Schema::hasColumn('technologies', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
        });

        Schema::table('request_items', function (Blueprint $table) {
            if (Schema::hasColumn('request_items', 'sub_city_id')) {
                $table->dropForeign(['sub_city_id']);
                $table->dropColumn('sub_city_id');
            }
            if (Schema::hasColumn('request_items', 'updated_by_id')) {
                $table->dropForeign(['updated_by_id']);
                $table->dropColumn('updated_by_id');
            }
            if (Schema::hasColumn('request_items', 'created_by_id')) {
                $table->dropForeign(['created_by_id']);
                $table->dropColumn('created_by_id');
            }
        });

        // Restore sub_city string column to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'sub_city')) {
                $table->string('sub_city')->nullable()->after('phone');
            }
        });
    }
};
