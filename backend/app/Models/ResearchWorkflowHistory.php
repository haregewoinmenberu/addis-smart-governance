<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\ResearchStage;

class ResearchWorkflowHistory extends Model
{
    protected $table = 'research_workflow_history';

    protected $fillable = [
        'research_project_id',
        'from_stage',
        'to_stage',
        'transition_reason',
        'transitioned_by',
        'transitioned_at',
    ];

    protected $casts = [
        'from_stage' => ResearchStage::class,
        'to_stage' => ResearchStage::class,
        'transitioned_at' => 'datetime',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function transitioner()
    {
        return $this->belongsTo(User::class, 'transitioned_by');
    }
}
