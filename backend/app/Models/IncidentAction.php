<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentAction extends Model
{
    protected $fillable = ['technology_incident_id', 'action_type', 'description', 'performed_by', 'performed_at'];

    protected $casts = ['performed_at' => 'datetime'];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(TechnologyIncident::class, 'technology_incident_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
