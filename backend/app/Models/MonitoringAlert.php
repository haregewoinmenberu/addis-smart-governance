<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\IncidentSeverity;

class MonitoringAlert extends Model
{
    protected $fillable = [
        'technology_monitoring_id', 'alert_type', 'severity', 'message', 'details',
        'is_acknowledged', 'acknowledged_by', 'acknowledged_at', 'triggered_at'
    ];

    protected $casts = [
        'severity' => IncidentSeverity::class,
        'is_acknowledged' => 'boolean',
        'acknowledged_at' => 'datetime',
        'triggered_at' => 'datetime',
    ];

    public function monitoring(): BelongsTo
    {
        return $this->belongsTo(TechnologyMonitoring::class, 'technology_monitoring_id');
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
