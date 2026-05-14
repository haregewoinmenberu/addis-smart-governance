<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => [
                ['category' => 'Branding', 'name' => 'Portal identity', 'status' => 'Configured'],
                ['category' => 'Security', 'name' => 'Password policy', 'status' => 'Enforced'],
                ['category' => 'Integrations', 'name' => 'SMS gateway', 'status' => 'Pending'],
                ['category' => 'Notifications', 'name' => 'Email templates', 'status' => 'Configured'],
                ['category' => 'Workflow', 'name' => 'Approval SLA rules', 'status' => 'Configured'],
            ],
        ]);
    }

    /**
     * Get system settings.
     */
    public function show()
    {
        $settings = SystemSetting::getAll();

        return response()->json($settings);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        // Validate based on section
        $data = $request->validate([
            'general' => ['sometimes', 'array'],
            'general.authority_name' => ['sometimes', 'string', 'max:255'],
            'general.default_language' => ['sometimes', 'string', 'in:en,am'],
            'general.timezone' => ['sometimes', 'string'],
            'general.fiscal_year' => ['sometimes', 'string'],
            'general.smart_city_module' => ['sometimes', 'boolean'],
            'general.public_portal' => ['sometimes', 'boolean'],
            
            'branding' => ['sometimes', 'array'],
            'branding.logo_url' => ['nullable', 'string'],
            'branding.primary_color' => ['sometimes', 'string'],
            'branding.dark_mode_default' => ['sometimes', 'boolean'],
            'branding.high_contrast' => ['sometimes', 'boolean'],
            
            'security' => ['sometimes', 'array'],
            'security.enforce_sso' => ['sometimes', 'boolean'],
            'security.require_mfa' => ['sometimes', 'boolean'],
            'security.password_rotation_days' => ['sometimes', 'integer', 'min:0'],
            'security.session_timeout_minutes' => ['sometimes', 'integer', 'min:5'],
            'security.ip_allowlist_enabled' => ['sometimes', 'boolean'],
            
            'notifications' => ['sometimes', 'array'],
            'notifications.email_enabled' => ['sometimes', 'boolean'],
            'notifications.sms_enabled' => ['sometimes', 'boolean'],
            'notifications.in_app_enabled' => ['sometimes', 'boolean'],
            'notifications.webhook_enabled' => ['sometimes', 'boolean'],
            
            'workflow' => ['sometimes', 'array'],
            'workflow.auto_escalate_hours' => ['sometimes', 'integer', 'min:0'],
            'workflow.parallel_approvals' => ['sometimes', 'boolean'],
            'workflow.require_signature' => ['sometimes', 'boolean'],
        ]);

        // Get old settings for logging
        $oldSettings = SystemSetting::getAll();

        // Update settings in database
        SystemSetting::updateMany($data);

        // Log the change
        ActivityLog::log('update_settings', 'settings', $request->user(), $oldSettings, $data);

        // Get updated settings
        $updatedSettings = SystemSetting::getAll();

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => $updatedSettings,
        ]);
    }

    /**
     * Get a specific setting value.
     */
    public function getSetting(Request $request, string $key)
    {
        $value = SystemSetting::get($key);

        return response()->json([
            'key' => $key,
            'value' => $value,
        ]);
    }

    /**
     * Update a specific setting value.
     */
    public function updateSetting(Request $request, string $key)
    {
        $data = $request->validate([
            'value' => ['required'],
        ]);

        $parts = explode('.', $key);
        $category = $parts[0] ?? 'general';

        // Get existing setting to determine type
        $existing = \App\Models\SystemSetting::where('key', $key)->first();
        $type = $existing ? $existing->type : 'string';

        SystemSetting::set($key, $data['value'], $category, $type);

        ActivityLog::log('update_setting', 'settings', $request->user(), null, [
            'key' => $key,
            'value' => $data['value'],
        ]);

        return response()->json([
            'message' => 'Setting updated successfully',
            'key' => $key,
            'value' => SystemSetting::get($key),
        ]);
    }

    /**
     * Clear settings cache.
     */
    public function clearCache()
    {
        SystemSetting::clearCache();

        return response()->json([
            'message' => 'Settings cache cleared successfully',
        ]);
    }
}

