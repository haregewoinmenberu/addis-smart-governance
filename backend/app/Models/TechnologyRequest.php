<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\TechnologyStage;

class TechnologyRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'request_number', 'name', 'category', 'type', 'description', 'purpose',
        'business_problem', 'expected_benefits', 'innovation_level', 'trl_level',
        'owner_organization_id', 'vendor_name', 'vendor_contact', 'contact_person',
        'contact_email', 'contact_phone', 'source_type', 'research_project_id',
        'technical_documentation', 'architecture_diagram', 'api_documentation',
        'licenses', 'source_code_repository', 'required_infrastructure',
        'deployment_requirements', 'dependencies', 'estimated_cost', 'expected_users',
        'current_stage', 'status', 'submitted_by', 'sub_city_id', 'submitted_at', 'approved_at'
    ];

    protected $casts = [
        'current_stage' => TechnologyStage::class,
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'estimated_cost' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->request_number)) {
                $model->request_number = 'TECH-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function ownerOrganization(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'owner_organization_id');
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function subCity(): BelongsTo
    {
        return $this->belongsTo(SubCity::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(TechnologyEvaluation::class);
    }

    public function committeeReviews(): HasMany
    {
        return $this->hasMany(CommitteeReview::class);
    }

    public function registry()
    {
        return $this->hasOne(TechnologyRegistry::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TechnologyDocument::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(TechnologyVersion::class);
    }

    public function workflowHistory(): HasMany
    {
        return $this->hasMany(TechnologyWorkflowHistory::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TechnologyComment::class);
    }
}
