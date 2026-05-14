<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'category',
        'type',
        'description',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value, string $category = 'general', string $type = 'string'): void
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'value' => self::prepareValue($value, $type),
                'category' => $category,
                'type' => $type,
            ]
        );

        Cache::forget("setting.{$key}");
        Cache::forget('settings.all');
    }

    /**
     * Get all settings grouped by category.
     */
    public static function getAll(): array
    {
        return Cache::remember('settings.all', 3600, function () {
            $settings = self::all();
            $grouped = [];

            foreach ($settings as $setting) {
                $parts = explode('.', $setting->key);
                $category = $parts[0];
                $field = $parts[1] ?? $setting->key;

                if (!isset($grouped[$category])) {
                    $grouped[$category] = [];
                }

                $grouped[$category][$field] = self::castValue($setting->value, $setting->type);
            }

            return $grouped;
        });
    }

    /**
     * Update multiple settings at once.
     */
    public static function updateMany(array $settings): void
    {
        foreach ($settings as $category => $fields) {
            foreach ($fields as $field => $value) {
                $key = "{$category}.{$field}";
                $existing = self::where('key', $key)->first();
                
                if ($existing) {
                    $existing->update([
                        'value' => self::prepareValue($value, $existing->type),
                    ]);
                    Cache::forget("setting.{$key}");
                }
            }
        }

        Cache::forget('settings.all');
    }

    /**
     * Cast value based on type.
     */
    protected static function castValue($value, string $type)
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Prepare value for storage.
     */
    protected static function prepareValue($value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'integer' => (string) $value,
            'json' => json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * Clear all settings cache.
     */
    public static function clearCache(): void
    {
        $settings = self::all();
        foreach ($settings as $setting) {
            Cache::forget("setting.{$setting->key}");
        }
        Cache::forget('settings.all');
    }
}
