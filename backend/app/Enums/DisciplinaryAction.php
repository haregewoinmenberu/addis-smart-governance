<?php

namespace App\Enums;

enum DisciplinaryAction: string
{
    case WARNING = 'warning';
    case FINE = 'fine';
    case TRAINING = 'training_requirement';
    case SUSPENSION = 'temporary_suspension';
    case RESTRICTION = 'practice_restriction';
    case REVOCATION = 'license_revocation';

    public function label(): string
    {
        return match($this) {
            self::WARNING => 'Warning',
            self::FINE => 'Fine',
            self::TRAINING => 'Training Requirement',
            self::SUSPENSION => 'Temporary Suspension',
            self::RESTRICTION => 'Practice Restriction',
            self::REVOCATION => 'License Revocation',
        };
    }

    public function severity(): int
    {
        return match($this) {
            self::WARNING => 1,
            self::FINE => 2,
            self::TRAINING => 3,
            self::RESTRICTION => 4,
            self::SUSPENSION => 5,
            self::REVOCATION => 6,
        };
    }

    public function color(): string
    {
        return match($this) {
            self::WARNING => 'yellow',
            self::FINE => 'orange',
            self::TRAINING => 'blue',
            self::RESTRICTION => 'purple',
            self::SUSPENSION => 'red',
            self::REVOCATION => 'red',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
