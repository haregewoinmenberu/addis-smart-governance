<?php

namespace App\Enums;

enum DeploymentPhase: string
{
    case PLANNING = 'planning';
    case PILOT = 'pilot';
    case UAT = 'uat'; // User Acceptance Testing
    case TRAINING = 'training';
    case PRODUCTION = 'production';
    case POST_DEPLOYMENT = 'post_deployment';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match($this) {
            self::PLANNING => 'Planning',
            self::PILOT => 'Pilot',
            self::UAT => 'User Acceptance Testing',
            self::TRAINING => 'Training',
            self::PRODUCTION => 'Production Deployment',
            self::POST_DEPLOYMENT => 'Post Deployment Review',
            self::COMPLETED => 'Completed',
        };
    }

    public function next(): ?self
    {
        return match($this) {
            self::PLANNING => self::PILOT,
            self::PILOT => self::UAT,
            self::UAT => self::TRAINING,
            self::TRAINING => self::PRODUCTION,
            self::PRODUCTION => self::POST_DEPLOYMENT,
            self::POST_DEPLOYMENT => self::COMPLETED,
            default => null,
        };
    }
}
