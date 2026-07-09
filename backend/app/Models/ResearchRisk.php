<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchRisk extends Model
{
    protected $fillable = [
        'research_project_id',
        'title',
        'description',
        'category',
        'probability',
        'impact',
        'mitigation_strategy',
        'status',
        'identified_by',
        'assigned_to',
        'identified_date',
        'resolved_date',
    ];

    protected $casts = [
        'identified_date' => 'date',
        'resolved_date' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function identifier()
    {
        return $this->belongsTo(User::class, 'identified_by');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
