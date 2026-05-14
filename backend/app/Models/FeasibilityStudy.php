<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeasibilityStudy extends Model
{
    protected $fillable = [
        'request_item_id',
        'technical_score',
        'financial_score',
        'security_score',
        'infrastructure_score',
        'integration_score',
        'sustainability_score',
        'overall_risk_score',
        'recommendation',
        'evaluated_by',
        'evaluated_at',
    ];

    protected $casts = [
        'technical_score' => 'decimal:2',
        'financial_score' => 'decimal:2',
        'security_score' => 'decimal:2',
        'infrastructure_score' => 'decimal:2',
        'integration_score' => 'decimal:2',
        'sustainability_score' => 'decimal:2',
        'overall_risk_score' => 'decimal:2',
        'evaluated_at' => 'datetime',
    ];

    /**
     * Get the request item for this feasibility study.
     */
    public function requestItem(): BelongsTo
    {
        return $this->belongsTo(RequestItem::class);
    }

    /**
     * Get the user who evaluated this.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }

    /**
     * Calculate overall risk score from individual scores.
     */
    public function calculateOverallRiskScore(): float
    {
        $scores = [
            $this->technical_score,
            $this->financial_score,
            $this->security_score,
            $this->infrastructure_score,
            $this->integration_score,
            $this->sustainability_score,
        ];

        $validScores = array_filter($scores, fn($score) => !is_null($score));
        
        return count($validScores) > 0 
            ? array_sum($validScores) / count($validScores) 
            : 0;
    }
}
    protected $fillable = [
        'title',
        'office',
        'status',
        'score',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'date',
        'score' => 'integer',
    ];
}
