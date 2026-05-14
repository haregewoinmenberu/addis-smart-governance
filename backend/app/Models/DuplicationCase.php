<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DuplicationCase extends Model
{
    protected $fillable = [
        'request_item_id',
        'existing_technology_id',
        'similarity_score',
        'recommendation',
        'analysis_notes',
        'analyzed_by',
    ];

    protected $casts = [
        'similarity_score' => 'decimal:2',
    ];

    /**
     * Get the request item for this duplication case.
     */
    public function requestItem(): BelongsTo
    {
        return $this->belongsTo(RequestItem::class);
    }

    /**
     * Get the existing technology.
     */
    public function existingTechnology(): BelongsTo
    {
        return $this->belongsTo(Technology::class, 'existing_technology_id');
    }

    /**
     * Get the user who analyzed this.
     */
    public function analyzer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'analyzed_by');
    }
}
