<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\EvaluationType;

class TechnologyEvaluation extends Model
{
    protected $fillable = [
        'technology_request_id', 'evaluation_type', 'evaluator_id', 'status',
        'score', 'risk_level', 'findings', 'recommendations', 'comments',
        'assigned_at', 'started_at', 'completed_at'
    ];

    protected $casts = [
        'evaluation_type' => EvaluationType::class,
        'assigned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function technologyRequest(): BelongsTo
    {
        return $this->belongsTo(TechnologyRequest::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(EvaluationChecklist::class);
    }
}
