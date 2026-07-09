<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TechnologyRegistry extends Model
{
    use SoftDeletes;

    protected $table = 'technology_registry';

    protected $fillable = [
        'technology_request_id', 'registry_number', 'license_type', 'license_expiration',
        'approval_certificate', 'owner_department_id', 'government_sector', 'compliance_status',
        'version', 'support_contact', 'maintenance_schedule', 'deployment_guide',
        'technology_status', 'registered_at', 'registered_by'
    ];

    protected $casts = [
        'license_expiration' => 'date',
        'registered_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->registry_number)) {
                $model->registry_number = 'REG-' . date('Y') . '-' . str_pad(static::whereYear('created_at', date('Y'))->count() + 1, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function technologyRequest(): BelongsTo
    {
        return $this->belongsTo(TechnologyRequest::class);
    }

    public function ownerDepartment(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'owner_department_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(TechnologyLicense::class);
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(DeploymentProject::class);
    }

    public function monitoring(): HasMany
    {
        return $this->hasMany(TechnologyMonitoring::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(TechnologyIncident::class);
    }

    public function revocations(): HasMany
    {
        return $this->hasMany(TechnologyRevocation::class);
    }
}
