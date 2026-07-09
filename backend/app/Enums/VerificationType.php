<?php

namespace App\Enums;

enum VerificationType: string
{
    case IDENTITY = 'identity';
    case EDUCATION = 'education';
    case EXPERIENCE = 'experience';
    case CERTIFICATE = 'certificate';
    case BACKGROUND = 'background';
    case PROFESSIONAL_HISTORY = 'professional_history';

    public function label(): string
    {
        return match($this) {
            self::IDENTITY => 'Identity Verification',
            self::EDUCATION => 'Education Verification',
            self::EXPERIENCE => 'Experience Verification',
            self::CERTIFICATE => 'Certificate Verification',
            self::BACKGROUND => 'Background Check',
            self::PROFESSIONAL_HISTORY => 'Professional History Check',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::IDENTITY => 'blue',
            self::EDUCATION => 'purple',
            self::EXPERIENCE => 'indigo',
            self::CERTIFICATE => 'cyan',
            self::BACKGROUND => 'pink',
            self::PROFESSIONAL_HISTORY => 'teal',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
