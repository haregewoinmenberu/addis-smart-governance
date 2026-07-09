<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnologyLicense extends Model
{
    protected $fillable = [
        'technology_registry_id', 'license_key', 'license_file', 'issue_date',
        'expiration_date', 'is_active', 'terms'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiration_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function registry(): BelongsTo
    {
        return $this->belongsTo(TechnologyRegistry::class, 'technology_registry_id');
    }
}
