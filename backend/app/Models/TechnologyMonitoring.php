<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TechnologyMonitoring extends Model
{
    protected $table = 'technology_monitoring';

    protected $fillable = [
        'technology_registry_id', 'monitoring_type', 'status', 'compliance_score',
        'risk_score', 'performance_score', 'availability_percentage', 'usage_count',
        'support_tickets', 'last_check_date', 'next_check_date'
    ];

    protected $casts = [
        'availability_percentage' => 'decimal:2',
        'last_check_date' => 'date',
        'next_check_date' => 'date',
    ];

    public function registry(): BelongsTo
    {
        return $this->belongsTo(TechnologyRegistry::class, 'technology_registry_id');
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(MonitoringMetric::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(MonitoringAlert::class);
    }
}
