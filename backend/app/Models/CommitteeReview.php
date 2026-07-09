<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\GovernanceDecision;

class CommitteeReview extends Model
{
    protected $fillable = [
        'technology_request_id', 'decision', 'conditions', 'comments',
        'meeting_minutes', 'digital_signature', 'meeting_date', 'decision_date', 'created_by'
    ];

    protected $casts = [
        'decision' => GovernanceDecision::class,
        'meeting_date' => 'datetime',
        'decision_date' => 'datetime',
    ];

    public function technologyRequest(): BelongsTo
    {
        return $this->belongsTo(TechnologyRequest::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CommitteeVote::class);
    }
}
