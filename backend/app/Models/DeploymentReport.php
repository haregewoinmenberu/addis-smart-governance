<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeploymentReport extends Model
{
    protected $fillable = [
        'deployment_project_id', 'report_type', 'content', 'issues',
        'lessons_learned', 'user_feedback', 'submitted_by', 'report_date'
    ];

    protected $casts = ['report_date' => 'date'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(DeploymentProject::class, 'deployment_project_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
