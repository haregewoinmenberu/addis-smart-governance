<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowDefinition extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'entity_type',
        'stages',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'stages' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this workflow.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all instances of this workflow.
     */
    public function instances(): HasMany
    {
        return $this->hasMany(WorkflowInstance::class);
    }

    /**
     * Get a specific stage by name.
     */
    public function getStage(string $stageName): ?array
    {
        return collect($this->stages)->firstWhere('name', $stageName);
    }

    /**
     * Get stage by index.
     */
    public function getStageByIndex(int $index): ?array
    {
        return $this->stages[$index] ?? null;
    }

    /**
     * Get next stage after current.
     */
    public function getNextStage(string $currentStageName): ?array
    {
        $stages = collect($this->stages);
        $currentIndex = $stages->search(fn($stage) => $stage['name'] === $currentStageName);
        
        if ($currentIndex === false) {
            return null;
        }

        return $stages->get($currentIndex + 1);
    }

    /**
     * Check if stage requires specific role.
     */
    public function stageRequiresRole(string $stageName): ?string
    {
        $stage = $this->getStage($stageName);
        return $stage['required_role'] ?? null;
    }
}
