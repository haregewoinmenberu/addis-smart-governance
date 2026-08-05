<?php

namespace App\Enums;

enum ResearchCategory: string
{
    // System Requests
    case SYSTEM_NEW = 'system_new';
    case SYSTEM_TRANSFER = 'system_transfer';
    case SYSTEM_UPGRADE = 'system_upgrade';

    // Infrastructure Requests
    case INFRASTRUCTURE_CLOUD = 'infrastructure_cloud';
    case INFRASTRUCTURE_SERVER = 'infrastructure_server';
    case INFRASTRUCTURE_NETWORK = 'infrastructure_network';
    case INFRASTRUCTURE_STORAGE = 'infrastructure_storage';
    case INFRASTRUCTURE_SECURITY = 'infrastructure_security';
    case INFRASTRUCTURE_DATA_CENTER = 'infrastructure_data_center';

    // Legacy fallback cases for backward compatibility
    case BASIC_RESEARCH = 'basic_research';
    case APPLIED_RESEARCH = 'applied_research';
    case EXPERIMENTAL_DEVELOPMENT = 'experimental_development';
    case INNOVATION = 'innovation';
    case PILOT_PROJECT = 'pilot_project';

    case SYSTEM_REQUEST = 'system_request';
    case INFRASTRUCTURE_REQUEST = 'infrastructure_request';
    case SECURITY_RELATED = 'security_related';

    // Technology Request unification additions
    case SYSTEM_CUSTOMIZATION = 'system_customization';
    case TECHNOLOGY_EVALUATION = 'technology_evaluation';
    case SMART_CITY_IMPROVEMENT = 'smart_city_improvement';

    public function label(): string
    {
        return match($this) {
            self::SYSTEM_NEW => 'New System Development Request',
            self::SYSTEM_TRANSFER => 'Existing System Transfer/Adoption Request',
            self::SYSTEM_UPGRADE => 'Existing System Upgrade Request',

            self::INFRASTRUCTURE_CLOUD => 'Cloud Infrastructure Request',
            self::INFRASTRUCTURE_SERVER => 'Server Infrastructure Request',
            self::INFRASTRUCTURE_NETWORK => 'Network Infrastructure Request',
            self::INFRASTRUCTURE_STORAGE => 'Storage Infrastructure Request',
            self::INFRASTRUCTURE_SECURITY => 'Security Infrastructure Request',
            self::INFRASTRUCTURE_DATA_CENTER => 'Data Center Infrastructure Request',

            self::BASIC_RESEARCH => 'System Request',
            self::APPLIED_RESEARCH => 'System Transfer',
            self::EXPERIMENTAL_DEVELOPMENT => 'System Upgrade',
            self::INNOVATION => 'Infrastructure Request',
            self::PILOT_PROJECT => 'Cloud/Data Center Request',

            self::SYSTEM_REQUEST => 'System Request',
            self::INFRASTRUCTURE_REQUEST => 'Infrastructure Request',
            self::SECURITY_RELATED => 'Security Related Request',

            self::SYSTEM_CUSTOMIZATION => 'Existing System Customization Request',
            self::TECHNOLOGY_EVALUATION => 'Technology Evaluation Request',
            self::SMART_CITY_IMPROVEMENT => 'Smart City Technology Improvement Request',
        };
    }

    /**
     * Determine if category is System or Infrastructure
     */
    public function requestType(): string
    {
        if (str_starts_with($this->value, 'infrastructure')) {
            return 'infrastructure';
        }
        return 'system';
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

