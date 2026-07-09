<?php

namespace App\Enums;

enum LicenseStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case SUSPENDED = 'suspended';
    case REVOKED = 'revoked';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::ACTIVE => 'Active',
            self::EXPIRED => 'Expired',
            self::SUSPENDED => 'Suspended',
            self::REVOKED => 'Revoked',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'gray',
            self::ACTIVE => 'green',
            self::EXPIRED => 'orange',
            self::SUSPENDED => 'yellow',
            self::REVOKED => 'red',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function canRenew(): bool
    {
        return in_array($this, [self::ACTIVE, self::EXPIRED]);
    }
}
