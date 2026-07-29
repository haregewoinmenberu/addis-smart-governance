<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchForwardRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_idea_id',
        'forwarded_by',
        'forwarded_to',
        'forward_message',
        'attachments',
        'recommendations',
        'forwarded_at',
        'acknowledged_at',
        'acknowledged_by',
        'status',
        'smart_city_feedback',
    ];

    protected $casts = [
        'attachments' => 'array',
        'recommendations' => 'array',
        'forwarded_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function forwardedBy()
    {
        return $this->belongsTo(User::class, 'forwarded_by');
    }

    public function forwardedTo()
    {
        return $this->belongsTo(User::class, 'forwarded_to');
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /**
     * Acknowledge receipt
     */
    public function acknowledge(User $user, ?string $feedback = null)
    {
        $this->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
            'acknowledged_by' => $user->id,
            'smart_city_feedback' => $feedback,
        ]);
    }
}
