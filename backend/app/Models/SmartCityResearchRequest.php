<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\Priority;

class SmartCityResearchRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_code',
        'title',
        'description',
        'problem_context',
        'requesting_sector',
        'priority',
        'status',
        'requested_by',
        'assigned_to',
        'research_project_id',
        'requested_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'outcome_summary',
        'metadata',
    ];

    protected $casts = [
        'requested_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'metadata' => 'array',
        'priority' => Priority::class,
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (!$request->request_code) {
                $request->request_code = 'SCR-' . date('Y') . '-' . str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    // Relationships
    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function communications()
    {
        return $this->hasMany(ResearchCommunication::class, 'research_project_id', 'research_project_id');
    }

    // Status helpers
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAssigned(): bool
    {
        return $this->status === 'assigned';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    // Actions
    public function assignToDirector(User $director): void
    {
        $this->update([
            'assigned_to' => $director->id,
            'status' => 'assigned',
        ]);
    }

    public function markInProgress(): void
    {
        $this->update(['status' => 'in_progress']);
    }

    public function complete(string $outcomeSummary): void
    {
        $this->update([
            'status' => 'completed',
            'actual_delivery_date' => now(),
            'outcome_summary' => $outcomeSummary,
        ]);
    }

    public function deliverToSmartCity(): void
    {
        $this->update(['status' => 'delivered']);
    }
}
