<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasRolesAndPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRolesAndPermissions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'sub_city_id',
        'department',
        'is_active',
        'last_login_at',
        'mfa_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'mfa_enabled' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get activity logs for this user.
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get sessions for this user.
     */
    public function sessions()
    {
        return $this->hasMany(UserSession::class);
    }

    /**
     * Get requests submitted by this user.
     */
    public function submittedRequests()
    {
        return $this->hasMany(RequestItem::class, 'submitted_by');
    }

    /**
     * Get workflow approvals by this user.
     */
    public function workflowApprovals()
    {
        return $this->hasMany(WorkflowApproval::class, 'approver_id');
    }

    /**
     * Get the sub-city this user belongs to.
     */
    public function subCity()
    {
        return $this->belongsTo(SubCity::class);
    }

    /**
     * Check if user is a sub-city administrator.
     */
    public function isSubCityAdmin()
    {
        return $this->hasRole('sub_city_admin');
    }

    /**
     * Check if user belongs to a specific sub-city.
     */
    public function belongsToSubCity($subCityId)
    {
        return $this->sub_city_id == $subCityId;
    }
} 
