<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchCommunication extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_project_id',
        'communication_type',
        'from_user_id',
        'to_user_id',
        'from_role',
        'to_role',
        'subject',
        'message',
        'attachments',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Relationships
    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    // Mark as read
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('to_user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('communication_type', $type);
    }
}
