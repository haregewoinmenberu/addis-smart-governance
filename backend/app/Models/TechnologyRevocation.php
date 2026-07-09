<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnologyRevocation extends Model
{
    protected $fillable = [
        'technology_registry_id', 'technology_incident_id', 'reason', 'committee_decision',
        'effective_date', 'revoked_by', 'corrective_actions', 'recovery_plan',
        'is_permanent', 'review_date'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'review_date' => 'date',
        'is_permanent' => 'boolean',
    ];

    public function registry(): BelongsTo
    {
        return $this->belongsTo(TechnologyRegistry::class, 'technology_registry_id');
    }

    public function incident(): BelongsTo
    {
        return $this->belongsTo(TechnologyIncident::class, 'technology_incident_id');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }
}
