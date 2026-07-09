<?php

namespace App\Enums;

enum ResearchStage: string
{
    case IDEA_IDENTIFICATION = 'idea_identification';
    case SCREENING = 'screening';
    case PROPOSAL_DEVELOPMENT = 'proposal_development';
    case APPROVAL = 'approval';
    case EXECUTION = 'execution';
    case EVALUATION = 'evaluation';
    case TECHNOLOGY_TRANSFER = 'technology_transfer';

    public function label(): string
    {
        return match($this) {
            self::IDEA_IDENTIFICATION => 'Idea Identification',
            self::SCREENING => 'Screening & Prioritization',
            self::PROPOSAL_DEVELOPMENT => 'Proposal Development',
            self::APPROVAL => 'Approval',
            self::EXECUTION => 'Execution',
            self::EVALUATION => 'Evaluation',
            self::TECHNOLOGY_TRANSFER => 'Technology Transfer',
        };
    }

    public function next(): ?self
    {
        return match($this) {
            self::IDEA_IDENTIFICATION => self::SCREENING,
            self::SCREENING => self::PROPOSAL_DEVELOPMENT,
            self::PROPOSAL_DEVELOPMENT => self::APPROVAL,
            self::APPROVAL => self::EXECUTION,
            self::EXECUTION => self::EVALUATION,
            self::EVALUATION => self::TECHNOLOGY_TRANSFER,
            self::TECHNOLOGY_TRANSFER => null,
        };
    }

    public function previous(): ?self
    {
        return match($this) {
            self::IDEA_IDENTIFICATION => null,
            self::SCREENING => self::IDEA_IDENTIFICATION,
            self::PROPOSAL_DEVELOPMENT => self::SCREENING,
            self::APPROVAL => self::PROPOSAL_DEVELOPMENT,
            self::EXECUTION => self::APPROVAL,
            self::EVALUATION => self::EXECUTION,
            self::TECHNOLOGY_TRANSFER => self::EVALUATION,
        };
    }

    public function canTransitionTo(self $stage): bool
    {
        return $this->next() === $stage;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
