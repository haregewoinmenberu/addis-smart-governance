<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LicensingWorkflowHistory extends Model
{
    use HasFactory;

    protected $table = 'licensing_workflow_history';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'user_id',
        'from_stage',
        'to_stage',
        'action',
        'comments',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function entity()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
