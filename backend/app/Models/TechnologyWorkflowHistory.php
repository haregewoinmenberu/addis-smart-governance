<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\TechnologyStage;

class TechnologyWorkflowHistory extends Model
{
    protected $table = 'technology_workflow_history';

    protected $fillable = [
        'technology_request_id', 'from_stage', 'to_stage', 'reason', 'comments', 'transitioned_by', 'transitioned_at'
    ];

    protected $casts = [
        'from_stage' => TechnologyStage::class,
        'to_stage' => TechnologyStage::class,
        'transitioned_at' => 'datetime',
    ];

    public function technologyRequest(): BelongsTo
    {
        return $this->belongsTo(TechnologyRequest::class);
    }

    public function transitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transitioned_by');
    }
}
