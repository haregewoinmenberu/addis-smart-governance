<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class InstitutionTeamMember extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'user_id',
        'email',
        'name',
        'role',
        'status',
        'invitation_token',
        'invited_at',
        'joined_at',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'joined_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'role_label',
        'status_label',
    ];

    /**
     * Get the institution that owns the team member.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Get the user associated with the team member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get role label.
     */
    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'admin' => 'Administrator',
            'manager' => 'Manager',
            'viewer' => 'Viewer',
            'collaborator' => 'Collaborator',
            default => 'Unknown',
        };
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'active' => 'Active',
            'invited' => 'Invited',
            'suspended' => 'Suspended',
            default => 'Unknown',
        };
    }

    /**
     * Generate invitation token.
     */
    public function generateInvitationToken(): string
    {
        $token = Str::random(64);
        $this->update([
            'invitation_token' => hash('sha256', $token),
            'invited_at' => now(),
        ]);
        
        return $token;
    }

    /**
     * Accept invitation.
     */
    public function acceptInvitation(User $user): bool
    {
        return $this->update([
            'user_id' => $user->id,
            'status' => 'active',
            'joined_at' => now(),
            'invitation_token' => null,
        ]);
    }

    /**
     * Get role permissions.
     */
    public function getPermissionsAttribute(): array
    {
        return match($this->role) {
            'admin' => [
                'manage_profile',
                'manage_team',
                'create_requests',
                'view_requests',
                'upload_documents',
                'delete_documents',
                'view_analytics',
            ],
            'manager' => [
                'view_profile',
                'create_requests',
                'view_requests',
                'upload_documents',
                'view_analytics',
            ],
            'collaborator' => [
                'view_profile',
                'create_requests',
                'view_requests',
                'upload_documents',
            ],
            'viewer' => [
                'view_profile',
                'view_requests',
            ],
            default => [],
        };
    }
}
