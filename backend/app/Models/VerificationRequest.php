<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\VerificationStatus;
use App\Enums\VerificationType;

class VerificationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'verification_type',
        'verifier_organization',
        'verifier_id',
        'status',
        'verification_details',
        'comments',
        'evidence',
        'requested_at',
        'completed_at',
    ];

    protected $casts = [
        'verification_type' => VerificationType::class,
        'status' => VerificationStatus::class,
        'evidence' => 'array',
        'requested_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(LicenseApplication::class, 'application_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }

    public function complete(string $result, ?string $comments = null): void
    {
        $this->update([
            'status' => $result,
            'comments' => $comments,
            'completed_at' => now(),
        ]);
    }
}
