<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchWorkflowStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'order',
        'is_required',
        'requires_approval',
        'approver_role',
        'applies_to',  // 'all', 'system', or 'infrastructure'
        'form_fields',
        'is_active',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'requires_approval' => 'boolean',
        'is_active' => 'boolean',
        'form_fields' => 'array',
    ];


    /**
     * Get progress records for this stage
     */
    public function progress()
    {
        return $this->hasMany(ResearchWorkflowProgress::class, 'stage_id');
    }

    /**
     * Scope to get only active stages
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get stages in order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
