<?php

namespace App\Enums;

enum ResearchCategory: string
{
    case BASIC_RESEARCH = 'basic_research';
    case APPLIED_RESEARCH = 'applied_research';
    case EXPERIMENTAL_DEVELOPMENT = 'experimental_development';
    case INNOVATION = 'innovation';
    case PILOT_PROJECT = 'pilot_project';

    public function label(): string
    {
        return match($this) {
            self::BASIC_RESEARCH => 'Basic Research',
            self::APPLIED_RESEARCH => 'Applied Research',
            self::EXPERIMENTAL_DEVELOPMENT => 'Experimental Development',
            self::INNOVATION => 'Innovation',
            self::PILOT_PROJECT => 'Pilot Project',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
