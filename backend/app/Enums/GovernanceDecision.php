<?php

namespace App\Enums;

enum GovernanceDecision: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case CONDITIONAL_APPROVAL = 'conditional_approval';
    case REJECTED = 'rejected';
    case REVISION_REQUIRED = 'revision_required';
    case SUSPENDED = 'suspended';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending Review',
            self::APPROVED => 'Approved',
            self::CONDITIONAL_APPROVAL => 'Conditional Approval',
            self::REJECTED => 'Rejected',
            self::REVISION_REQUIRED => 'Return for Revision',
            self::SUSPENDED => 'Suspended',
        };
    }

    public function isApproved(): bool
    {
        return in_array($this, [self::APPROVED, self::CONDITIONAL_APPROVAL]);
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::APPROVED, self::REJECTED]);
    }
}
