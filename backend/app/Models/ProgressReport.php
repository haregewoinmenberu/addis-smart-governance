<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressReport extends Model
{
    protected $fillable = [
        'research_project_id',
        'report_period',
        'report_date',
        'accomplishments',
        'challenges',
        'next_steps',
        'progress_percentage',
        'budget_spent',
        'budget_remaining',
        'submitted_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'budget_spent' => 'decimal:2',
        'budget_remaining' => 'decimal:2',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
