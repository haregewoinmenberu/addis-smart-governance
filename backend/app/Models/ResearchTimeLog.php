<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchTimeLog extends Model
{
    protected $fillable = [
        'research_project_id',
        'research_task_id',
        'user_id',
        'log_date',
        'hours',
        'description',
        'activity_type',
    ];

    protected $casts = [
        'log_date' => 'date',
        'hours' => 'decimal:2',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function task()
    {
        return $this->belongsTo(ResearchTask::class, 'research_task_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
