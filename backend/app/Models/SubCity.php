<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubCity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'address',
        'phone',
        'email',
        'website',
        'logo',
        'admin_name',
        'admin_email',
        'admin_phone',
        'settings',
        'metadata',
        'is_active',
        'activated_at',
        'deactivated_at',
        'subscription_tier',
        'subscription_expires_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
    ];

    /**
     * Get all users belonging to this sub-city.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the administrator user for this sub-city.
     */
    public function administrator()
    {
        return $this->hasOne(User::class)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'sub_city_admin');
            });
    }

    /**
     * Get all technologies registered by this sub-city.
     */
    public function technologies()
    {
        return $this->hasMany(Technology::class);
    }

    /**
     * Get all request items submitted by this sub-city.
     */
    public function requestItems()
    {
        return $this->hasMany(RequestItem::class);
    }

    /**
     * Get all surveys for this sub-city.
     */
    public function surveys()
    {
        return $this->hasMany(Survey::class);
    }

    /**
     * Get all audits for this sub-city.
     */
    public function audits()
    {
        return $this->hasMany(Audit::class);
    }

    /**
     * Get all cybersecurity issues for this sub-city.
     */
    public function cybersecurityIssues()
    {
        return $this->hasMany(CybersecurityIssue::class);
    }

    /**
     * Scope to get only active sub-cities.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Activate the sub-city.
     */
    public function activate()
    {
        $this->update([
            'is_active' => true,
            'activated_at' => now(),
            'deactivated_at' => null,
        ]);
    }

    /**
     * Deactivate the sub-city.
     */
    public function deactivate()
    {
        $this->update([
            'is_active' => false,
            'deactivated_at' => now(),
        ]);
    }

    /**
     * Get statistics for this sub-city.
     */
    public function getStatistics()
    {
        return [
            'total_users' => $this->users()->count(),
            'active_users' => $this->users()->where('is_active', true)->count(),
            'total_technologies' => $this->technologies()->count(),
            'total_requests' => $this->requestItems()->count(),
            'pending_requests' => $this->requestItems()->where('status', 'pending')->count(),
            'total_audits' => $this->audits()->count(),
            'total_cybersecurity_issues' => $this->cybersecurityIssues()->count(),
        ];
    }
}
