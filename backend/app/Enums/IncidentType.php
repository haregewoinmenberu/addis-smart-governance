<?php

namespace App\Enums;

enum IncidentType: string
{
    case SECURITY = 'security';
    case PERFORMANCE = 'performance';
    case LICENSE_COMPLIANCE = 'license_compliance';
    case OPERATIONAL = 'operational';
    case LEGAL = 'legal';
    case VULNERABILITY = 'vulnerability';
    case AVAILABILITY = 'availability';
    case DATA_BREACH = 'data_breach';
    case CONFIGURATION = 'configuration';
    case OTHER = 'other';

    public function label(): string
    {
        return match($this) {
            self::SECURITY => 'Security Issue',
            self::PERFORMANCE => 'Performance Issue',
            self::LICENSE_COMPLIANCE => 'License Compliance',
            self::OPERATIONAL => 'Operational Issue',
            self::LEGAL => 'Legal Issue',
            self::VULNERABILITY => 'Critical Vulnerability',
            self::AVAILABILITY => 'Availability Issue',
            self::DATA_BREACH => 'Data Breach',
            self::CONFIGURATION => 'Configuration Issue',
            self::OTHER => 'Other',
        };
    }

    public function requiresImmediateAction(): bool
    {
        return in_array($this, [
            self::SECURITY,
            self::VULNERABILITY,
            self::DATA_BREACH,
        ]);
    }
}
