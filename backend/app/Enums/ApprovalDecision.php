<?php

namespace App\Enums;

enum ApprovalDecision: string
{
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case REVISION_REQUESTED = 'revision_requested';
    case PENDING = 'pending';

    public function label(): string
    {
        return match($this) {
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::REVISION_REQUESTED => 'Revision Requested',
            self::PENDING => 'Pending',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::APPROVED => 'green',
            self::REJECTED => 'red',
            self::REVISION_REQUESTED => 'yellow',
            self::PENDING => 'gray',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
