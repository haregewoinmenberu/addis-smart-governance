<?php

namespace App\Services;

use App\Models\SystemSetting;

class SettingsService
{
    /**
     * Get general settings.
     */
    public static function getGeneral(): array
    {
        return [
            'authority_name' => SystemSetting::get('general.authority_name', 'Addis Ababa City ITDB'),
            'default_language' => SystemSetting::get('general.default_language', 'en'),
            'timezone' => SystemSetting::get('general.timezone', 'Africa/Addis_Ababa'),
            'fiscal_year' => SystemSetting::get('general.fiscal_year', 'Jul-Jun'),
            'smart_city_module' => SystemSetting::get('general.smart_city_module', true),
            'public_portal' => SystemSetting::get('general.public_portal', false),
        ];
    }

    /**
     * Get branding settings.
     */
    public static function getBranding(): array
    {
        return [
            'logo_url' => SystemSetting::get('branding.logo_url'),
            'primary_color' => SystemSetting::get('branding.primary_color', '#147361'),
            'dark_mode_default' => SystemSetting::get('branding.dark_mode_default', false),
            'high_contrast' => SystemSetting::get('branding.high_contrast', false),
        ];
    }

    /**
     * Get security settings.
     */
    public static function getSecurity(): array
    {
        return [
            'enforce_sso' => SystemSetting::get('security.enforce_sso', true),
            'require_mfa' => SystemSetting::get('security.require_mfa', true),
            'password_rotation_days' => SystemSetting::get('security.password_rotation_days', 90),
            'session_timeout_minutes' => SystemSetting::get('security.session_timeout_minutes', 30),
            'ip_allowlist_enabled' => SystemSetting::get('security.ip_allowlist_enabled', false),
        ];
    }

    /**
     * Get notification settings.
     */
    public static function getNotifications(): array
    {
        return [
            'email_enabled' => SystemSetting::get('notifications.email_enabled', true),
            'sms_enabled' => SystemSetting::get('notifications.sms_enabled', true),
            'in_app_enabled' => SystemSetting::get('notifications.in_app_enabled', true),
            'webhook_enabled' => SystemSetting::get('notifications.webhook_enabled', false),
        ];
    }

    /**
     * Get workflow settings.
     */
    public static function getWorkflow(): array
    {
        return [
            'auto_escalate_hours' => SystemSetting::get('workflow.auto_escalate_hours', 48),
            'parallel_approvals' => SystemSetting::get('workflow.parallel_approvals', false),
            'require_signature' => SystemSetting::get('workflow.require_signature', true),
        ];
    }

    /**
     * Check if a feature is enabled.
     */
    public static function isFeatureEnabled(string $feature): bool
    {
        return (bool) SystemSetting::get($feature, false);
    }

    /**
     * Check if MFA is required.
     */
    public static function isMfaRequired(): bool
    {
        return (bool) SystemSetting::get('security.require_mfa', true);
    }

    /**
     * Check if SSO is enforced.
     */
    public static function isSsoEnforced(): bool
    {
        return (bool) SystemSetting::get('security.enforce_sso', true);
    }

    /**
     * Get session timeout in minutes.
     */
    public static function getSessionTimeout(): int
    {
        return (int) SystemSetting::get('security.session_timeout_minutes', 30);
    }

    /**
     * Get password rotation days.
     */
    public static function getPasswordRotationDays(): int
    {
        return (int) SystemSetting::get('security.password_rotation_days', 90);
    }

    /**
     * Get auto-escalation hours.
     */
    public static function getAutoEscalateHours(): int
    {
        return (int) SystemSetting::get('workflow.auto_escalate_hours', 48);
    }

    /**
     * Check if email notifications are enabled.
     */
    public static function isEmailEnabled(): bool
    {
        return (bool) SystemSetting::get('notifications.email_enabled', true);
    }

    /**
     * Check if SMS notifications are enabled.
     */
    public static function isSmsEnabled(): bool
    {
        return (bool) SystemSetting::get('notifications.sms_enabled', true);
    }

    /**
     * Check if in-app notifications are enabled.
     */
    public static function isInAppEnabled(): bool
    {
        return (bool) SystemSetting::get('notifications.in_app_enabled', true);
    }

    /**
     * Get primary brand color.
     */
    public static function getPrimaryColor(): string
    {
        return SystemSetting::get('branding.primary_color', '#147361');
    }

    /**
     * Get organization name.
     */
    public static function getOrganizationName(): string
    {
        return SystemSetting::get('general.authority_name', 'Addis Ababa City ITDB');
    }
}
