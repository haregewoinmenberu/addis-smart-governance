<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TechnologyAuditLog extends Model
{
    protected $fillable = [
        'auditable_type', 'auditable_id', 'action', 'user_id', 'old_values', 'new_values', 'ip_address', 'user_agent', 'performed_at'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'performed_at' => 'datetime',
    ];

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function log(string $action, $model, ?array $oldValues, ?array $newValues, string $ipAddress = null, string $userAgent = null)
    {
        return static::create([
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'action' => $action,
            'user_id' => auth()->id(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
            'performed_at' => now(),
        ]);
    }
}
