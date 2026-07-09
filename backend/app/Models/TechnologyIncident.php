<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\IncidentType;
use App\Enums\IncidentSeverity;

class TechnologyIncident extends Model
{
    protected $fillable = [
        'incident_number', 'technology_registry_id', 'incident_type', 'severity', 'status',
        'title', 'description', 'impact', 'reported_by', 'assigned_to', 'reported_at',
        'acknowledged_at', 'resolved_at', 'resolution', 'requires_revocation'
    ];

    protected $casts = [
        'incident_type' => IncidentType::class,
        'severity' => IncidentSeverity::class,
        'reported_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'requires_revocation' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->incident_number)) {
                $model->incident_number = 'INC-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function registry(): BelongsTo
    {
        return $this->belongsTo(TechnologyRegistry::class, 'technology_registry_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(IncidentAction::class);
    }

    public function revocations(): HasMany
    {
        return $this->hasMany(TechnologyRevocation::class);
    }
}
