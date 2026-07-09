<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\DeploymentPhase;

class DeploymentProject extends Model
{
    protected $fillable = [
        'technology_registry_id', 'project_name', 'current_phase', 'progress_percentage',
        'start_date', 'end_date', 'project_manager_id', 'objectives', 'success_metrics', 'status'
    ];

    protected $casts = [
        'current_phase' => DeploymentPhase::class,
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function registry(): BelongsTo
    {
        return $this->belongsTo(TechnologyRegistry::class, 'technology_registry_id');
    }

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function sites(): HasMany
    {
        return $this->hasMany(DeploymentSite::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(DeploymentReport::class);
    }
}
