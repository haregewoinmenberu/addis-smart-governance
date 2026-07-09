<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonitoringMetric extends Model
{
    protected $fillable = [
        'technology_monitoring_id', 'metric_name', 'metric_value', 'unit', 'status', 'recorded_at'
    ];

    protected $casts = ['recorded_at' => 'datetime'];

    public function monitoring(): BelongsTo
    {
        return $this->belongsTo(TechnologyMonitoring::class, 'technology_monitoring_id');
    }
}
