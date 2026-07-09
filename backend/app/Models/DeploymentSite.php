<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeploymentSite extends Model
{
    protected $fillable = [
        'deployment_project_id', 'site_name', 'location', 'site_manager_id',
        'deployment_status', 'deployment_date', 'users_count', 'notes'
    ];

    protected $casts = ['deployment_date' => 'date'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(DeploymentProject::class, 'deployment_project_id');
    }

    public function siteManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'site_manager_id');
    }
}
