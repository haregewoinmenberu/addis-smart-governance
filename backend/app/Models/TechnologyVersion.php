<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnologyVersion extends Model
{
    protected $fillable = ['technology_request_id', 'version_number', 'changes', 'data_snapshot', 'created_by'];

    public function technologyRequest(): BelongsTo
    {
        return $this->belongsTo(TechnologyRequest::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
