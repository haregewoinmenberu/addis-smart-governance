<?php

namespace App\Enums;

enum PracticeStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case ON_LEAVE = 'on_leave';
    case RESTRICTED = 'restricted';
    case SUSPENDED = 'suspended';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active Practice',
            self::INACTIVE => 'Inactive',
            self::ON_LEAVE => 'On Leave',
            self::RESTRICTED => 'Restricted Practice',
            self::SUSPENDED => 'Suspended',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::ACTIVE => 'green',
            self::INACTIVE => 'gray',
            self::ON_LEAVE => 'blue',
            self::RESTRICTED => 'yellow',
            self::SUSPENDED => 'red',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
