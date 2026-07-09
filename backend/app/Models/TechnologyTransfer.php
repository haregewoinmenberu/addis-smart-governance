<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnologyTransfer extends Model
{
    protected $fillable = [
        'research_project_id',
        'transfer_code',
        'transfer_package',
        'receiving_organization',
        'deployment_plan',
        'training_plan',
        'documentation',
        'intellectual_property',
        'commercialization_status',
        'deployment_status',
        'transfer_date',
        'deployment_date',
        'success_metrics',
        'impact_assessment',
        'transferred_by',
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'deployment_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transfer) {
            if (!$transfer->transfer_code) {
                $transfer->transfer_code = 'TT-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function transferrer()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
