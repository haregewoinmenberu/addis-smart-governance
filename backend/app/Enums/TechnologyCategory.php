<?php

namespace App\Enums;

enum TechnologyCategory: string
{
    case SOFTWARE = 'software';
    case HARDWARE = 'hardware';
    case INFRASTRUCTURE = 'infrastructure';
    case PLATFORM = 'platform';
    case FRAMEWORK = 'framework';
    case TOOL = 'tool';
    case SERVICE = 'service';
    case API = 'api';
    case DATABASE = 'database';
    case SECURITY = 'security';
    case AI_ML = 'ai_ml';
    case IOT = 'iot';
    case CLOUD = 'cloud';
    case MOBILE = 'mobile';
    case WEB = 'web';
    case NETWORK = 'network';
    case OTHER = 'other';

    public function label(): string
    {
        return match($this) {
            self::SOFTWARE => 'Software',
            self::HARDWARE => 'Hardware',
            self::INFRASTRUCTURE => 'Infrastructure',
            self::PLATFORM => 'Platform',
            self::FRAMEWORK => 'Framework',
            self::TOOL => 'Tool',
            self::SERVICE => 'Service',
            self::API => 'API',
            self::DATABASE => 'Database',
            self::SECURITY => 'Security',
            self::AI_ML => 'AI & Machine Learning',
            self::IOT => 'Internet of Things',
            self::CLOUD => 'Cloud Computing',
            self::MOBILE => 'Mobile',
            self::WEB => 'Web',
            self::NETWORK => 'Network',
            self::OTHER => 'Other',
        };
    }
}
