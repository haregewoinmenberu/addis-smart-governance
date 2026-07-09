<?php

namespace App\Enums;

enum TechnologyStage: string
{
    case SUBMISSION = 'submission';
    case EVALUATION = 'evaluation';
    case GOVERNANCE_DECISION = 'governance_decision';
    case LICENSING = 'licensing';
    case ADOPTION = 'adoption';
    case MONITORING = 'monitoring';
    case INCIDENT = 'incident';
    case REVOKED = 'revoked';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match($this) {
            self::SUBMISSION => 'Technology Submission',
            self::EVALUATION => 'Parallel Evaluation',
            self::GOVERNANCE_DECISION => 'Governance Decision',
            self::LICENSING => 'Licensing & Registry',
            self::ADOPTION => 'Technology Adoption',
            self::MONITORING => 'Continuous Monitoring',
            self::INCIDENT => 'Incident & Revocation',
            self::REVOKED => 'Revoked',
            self::COMPLETED => 'Completed',
        };
    }

    public function next(): ?self
    {
        return match($this) {
            self::SUBMISSION => self::EVALUATION,
            self::EVALUATION => self::GOVERNANCE_DECISION,
            self::GOVERNANCE_DECISION => self::LICENSING,
            self::LICENSING => self::ADOPTION,
            self::ADOPTION => self::MONITORING,
            self::MONITORING => self::COMPLETED,
            default => null,
        };
    }

    public function canTransitionTo(self $target): bool
    {
        $transitions = [
            self::SUBMISSION->value => [self::EVALUATION->value],
            self::EVALUATION->value => [self::GOVERNANCE_DECISION->value],
            self::GOVERNANCE_DECISION->value => [self::LICENSING->value, self::SUBMISSION->value],
            self::LICENSING->value => [self::ADOPTION->value],
            self::ADOPTION->value => [self::MONITORING->value, self::LICENSING->value],
            self::MONITORING->value => [self::INCIDENT->value, self::COMPLETED->value],
            self::INCIDENT->value => [self::REVOKED->value, self::MONITORING->value],
        ];

        return in_array($target->value, $transitions[$this->value] ?? []);
    }
}
