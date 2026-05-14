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
        Schema::create('sub_cities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            
            // Administrator details
            $table->string('admin_name')->nullable();
            $table->string('admin_email')->nullable();
            $table->string('admin_phone')->nullable();
            
            // Organization settings
            $table->json('settings')->nullable();
            $table->json('metadata')->nullable();
            
            // Status and activation
            $table->boolean('is_active')->default(true);
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('deactivated_at')->nullable();
            
            // Subscription/License info (for future use)
            $table->string('subscription_tier')->default('basic');
            $table->timestamp('subscription_expires_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });

        // Update users table to add sub_city_id foreign key
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('sub_city_id')->nullable()->after('department')->constrained('sub_cities')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['sub_city_id']);
            $table->dropColumn('sub_city_id');
        });
        
        Schema::dropIfExists('sub_cities');
    }
};
