<?php

namespace App\Enums;

enum EvaluationType: string
{
    case RISK_ASSESSMENT = 'risk_assessment';
    case SECURITY_COMPLIANCE = 'security_compliance';
    case INTEROPERABILITY = 'interoperability';
    case LEGAL_COMPLIANCE = 'legal_compliance';
    case FINANCIAL_ASSESSMENT = 'financial_assessment';
    case ARCHITECTURE_REVIEW = 'architecture_review';
    case DATA_PRIVACY = 'data_privacy';
    case PERFORMANCE = 'performance';
    case USABILITY = 'usability';
    case MAINTAINABILITY = 'maintainability';

    public function label(): string
    {
        return match($this) {
            self::RISK_ASSESSMENT => 'Risk Assessment',
            self::SECURITY_COMPLIANCE => 'Security Compliance',
            self::INTEROPERABILITY => 'Interoperability Check',
            self::LEGAL_COMPLIANCE => 'Legal Compliance',
            self::FINANCIAL_ASSESSMENT => 'Financial Assessment',
            self::ARCHITECTURE_REVIEW => 'Architecture Review',
            self::DATA_PRIVACY => 'Data Privacy Review',
            self::PERFORMANCE => 'Performance Evaluation',
            self::USABILITY => 'Usability Review',
            self::MAINTAINABILITY => 'Maintainability Review',
        };
    }

    public function requiredRole(): string
    {
        return match($this) {
            self::RISK_ASSESSMENT => 'risk_officer',
            self::SECURITY_COMPLIANCE => 'security_officer',
            self::INTEROPERABILITY => 'enterprise_architect',
            self::LEGAL_COMPLIANCE => 'legal_officer',
            self::FINANCIAL_ASSESSMENT => 'financial_officer',
            self::ARCHITECTURE_REVIEW => 'enterprise_architect',
            self::DATA_PRIVACY => 'compliance_officer',
            self::PERFORMANCE => 'technical_reviewer',
            self::USABILITY => 'ux_specialist',
            self::MAINTAINABILITY => 'technical_reviewer',
        };
    }
}
