<?php

namespace App\Enums;

enum ComplaintStatus: string
{
    case RECEIVED = 'received';
    case INVESTIGATING = 'investigating';
    case EVIDENCE_COLLECTION = 'evidence_collection';
    case HEARING_SCHEDULED = 'hearing_scheduled';
    case DECISION_PENDING = 'decision_pending';
    case RESOLVED = 'resolved';
    case DISMISSED = 'dismissed';
    case APPEALED = 'appealed';

    public function label(): string
    {
        return match($this) {
            self::RECEIVED => 'Received',
            self::INVESTIGATING => 'Under Investigation',
            self::EVIDENCE_COLLECTION => 'Evidence Collection',
            self::HEARING_SCHEDULED => 'Hearing Scheduled',
            self::DECISION_PENDING => 'Decision Pending',
            self::RESOLVED => 'Resolved',
            self::DISMISSED => 'Dismissed',
            self::APPEALED => 'Appealed',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::RECEIVED => 'blue',
            self::INVESTIGATING => 'yellow',
            self::EVIDENCE_COLLECTION => 'yellow',
            self::HEARING_SCHEDULED => 'orange',
            self::DECISION_PENDING => 'orange',
            self::RESOLVED => 'green',
            self::DISMISSED => 'gray',
            self::APPEALED => 'purple',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
