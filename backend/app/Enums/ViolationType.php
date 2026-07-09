<?php

namespace App\Enums;

enum ViolationType: string
{
    case ETHICAL = 'ethical_violation';
    case MISCONDUCT = 'professional_misconduct';
    case SAFETY = 'safety_violation';
    case FRAUD = 'fraud';
    case REGULATORY = 'regulatory_violation';
    case CRIMINAL = 'criminal_record';

    public function label(): string
    {
        return match($this) {
            self::ETHICAL => 'Ethical Violation',
            self::MISCONDUCT => 'Professional Misconduct',
            self::SAFETY => 'Safety Violation',
            self::FRAUD => 'Fraud',
            self::REGULATORY => 'Regulatory Violation',
            self::CRIMINAL => 'Criminal Record',
        };
    }

    public function severity(): string
    {
        return match($this) {
            self::ETHICAL => 'medium',
            self::MISCONDUCT => 'high',
            self::SAFETY => 'high',
            self::FRAUD => 'critical',
            self::REGULATORY => 'medium',
            self::CRIMINAL => 'critical',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::ETHICAL => 'yellow',
            self::MISCONDUCT => 'orange',
            self::SAFETY => 'red',
            self::FRAUD => 'red',
            self::REGULATORY => 'yellow',
            self::CRIMINAL => 'red',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
