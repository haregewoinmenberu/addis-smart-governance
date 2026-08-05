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
        'assigned_director_id',
        'assigned_team__leaders_id',
        'research_type',  // 'all', 'system_request', 'infrastructure_request', or 'security_related_request'
        'fillable_by_role', // null = no restriction, or 'research_director'|'research_team_leader'|'research_officer'
        'form_fields',
        'is_active',
        'assigned_officers_id',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'requires_approval' => 'boolean',
        'is_active' => 'boolean',
        'form_fields' => 'array',
        'assigned_team__leaders_id' => 'array',
        'assigned_officers_id' => 'array',
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
