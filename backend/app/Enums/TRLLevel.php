<?php

namespace App\Enums;

enum TRLLevel: int
{
    case BASIC_PRINCIPLES = 1;
    case TECHNOLOGY_CONCEPT = 2;
    case EXPERIMENTAL_PROOF = 3;
    case LAB_VALIDATION = 4;
    case RELEVANT_ENVIRONMENT = 5;
    case PROTOTYPE_DEMONSTRATION = 6;
    case OPERATIONAL_ENVIRONMENT = 7;
    case SYSTEM_COMPLETED = 8;
    case TECHNOLOGY_DEPLOYED = 9;

    public function label(): string
    {
        return match($this) {
            self::BASIC_PRINCIPLES => 'Basic principles observed',
            self::TECHNOLOGY_CONCEPT => 'Technology concept formulated',
            self::EXPERIMENTAL_PROOF => 'Experimental proof',
            self::LAB_VALIDATION => 'Lab validation',
            self::RELEVANT_ENVIRONMENT => 'Relevant environment validation',
            self::PROTOTYPE_DEMONSTRATION => 'Prototype demonstration',
            self::OPERATIONAL_ENVIRONMENT => 'Operational environment',
            self::SYSTEM_COMPLETED => 'System completed',
            self::TECHNOLOGY_DEPLOYED => 'Technology deployed',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::BASIC_PRINCIPLES => 'Scientific research begins, basic principles are observed',
            self::TECHNOLOGY_CONCEPT => 'Technology concept and/or application formulated',
            self::EXPERIMENTAL_PROOF => 'Analytical and experimental critical function proof of concept',
            self::LAB_VALIDATION => 'Component validation in laboratory environment',
            self::RELEVANT_ENVIRONMENT => 'Component validation in relevant environment',
            self::PROTOTYPE_DEMONSTRATION => 'System/subsystem model or prototype demonstration',
            self::OPERATIONAL_ENVIRONMENT => 'System prototype demonstration in operational environment',
            self::SYSTEM_COMPLETED => 'Actual system completed and qualified through test',
            self::TECHNOLOGY_DEPLOYED => 'Actual system proven through successful operations',
        };
    }

    public function color(): string
    {
        return match(true) {
            $this->value <= 3 => 'red',
            $this->value <= 6 => 'yellow',
            default => 'green',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
