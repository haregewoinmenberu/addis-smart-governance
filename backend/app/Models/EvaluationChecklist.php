<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationChecklist extends Model
{
    protected $fillable = ['technology_evaluation_id', 'item', 'checked', 'notes'];

    protected $casts = ['checked' => 'boolean'];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(TechnologyEvaluation::class, 'technology_evaluation_id');
    }
}
