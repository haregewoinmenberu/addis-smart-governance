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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('category')->default('general'); // general, branding, security, notifications, workflow
            $table->string('type')->default('string'); // string, boolean, integer, json
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('system_settings')->insert([
            // General Settings
            ['key' => 'general.authority_name', 'value' => 'Addis Ababa City ITDB', 'category' => 'general', 'type' => 'string', 'description' => 'Organization name', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'general.default_language', 'value' => 'en', 'category' => 'general', 'type' => 'string', 'description' => 'Default system language', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'general.timezone', 'value' => 'Africa/Addis_Ababa', 'category' => 'general', 'type' => 'string', 'description' => 'System timezone', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'general.fiscal_year', 'value' => 'Jul-Jun', 'category' => 'general', 'type' => 'string', 'description' => 'Fiscal year period', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'general.smart_city_module', 'value' => '1', 'category' => 'general', 'type' => 'boolean', 'description' => 'Enable Smart City Index AI module', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'general.public_portal', 'value' => '0', 'category' => 'general', 'type' => 'boolean', 'description' => 'Enable public transparency portal', 'created_at' => now(), 'updated_at' => now()],
            
            // Branding Settings
            ['key' => 'branding.logo_url', 'value' => null, 'category' => 'branding', 'type' => 'string', 'description' => 'Organization logo URL', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'branding.primary_color', 'value' => '#147361', 'category' => 'branding', 'type' => 'string', 'description' => 'Primary brand color', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'branding.dark_mode_default', 'value' => '0', 'category' => 'branding', 'type' => 'boolean', 'description' => 'Default to dark mode', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'branding.high_contrast', 'value' => '0', 'category' => 'branding', 'type' => 'boolean', 'description' => 'Enable high contrast mode', 'created_at' => now(), 'updated_at' => now()],
            
            // Security Settings
            ['key' => 'security.enforce_sso', 'value' => '1', 'category' => 'security', 'type' => 'boolean', 'description' => 'Enforce SSO/OIDC login', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'security.require_mfa', 'value' => '1', 'category' => 'security', 'type' => 'boolean', 'description' => 'Require multi-factor authentication', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'security.password_rotation_days', 'value' => '90', 'category' => 'security', 'type' => 'integer', 'description' => 'Password rotation period in days', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'security.session_timeout_minutes', 'value' => '30', 'category' => 'security', 'type' => 'integer', 'description' => 'Session timeout in minutes', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'security.ip_allowlist_enabled', 'value' => '0', 'category' => 'security', 'type' => 'boolean', 'description' => 'Enable IP allowlist', 'created_at' => now(), 'updated_at' => now()],
            
            // Notification Settings
            ['key' => 'notifications.email_enabled', 'value' => '1', 'category' => 'notifications', 'type' => 'boolean', 'description' => 'Enable email notifications', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'notifications.sms_enabled', 'value' => '1', 'category' => 'notifications', 'type' => 'boolean', 'description' => 'Enable SMS notifications', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'notifications.in_app_enabled', 'value' => '1', 'category' => 'notifications', 'type' => 'boolean', 'description' => 'Enable in-app notifications', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'notifications.webhook_enabled', 'value' => '0', 'category' => 'notifications', 'type' => 'boolean', 'description' => 'Enable webhook notifications', 'created_at' => now(), 'updated_at' => now()],
            
            // Workflow Settings
            ['key' => 'workflow.auto_escalate_hours', 'value' => '48', 'category' => 'workflow', 'type' => 'integer', 'description' => 'Auto-escalation timeout in hours', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'workflow.parallel_approvals', 'value' => '0', 'category' => 'workflow', 'type' => 'boolean', 'description' => 'Allow parallel approvals', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'workflow.require_signature', 'value' => '1', 'category' => 'workflow', 'type' => 'boolean', 'description' => 'Require digital signature', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
