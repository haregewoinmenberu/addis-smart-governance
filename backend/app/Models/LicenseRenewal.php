<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LicenseRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'renewal_number',
        'license_id',
        'professional_id',
        'previous_license_id',
        'renewal_period_start',
        'renewal_period_end',
        'application_date',
        'status',
        'is_late_renewal',
        'grace_period_days',
        'required_ce_hours',
        'completed_ce_hours',
        'documents_updated',
        'fee_paid',
        'fee_amount',
        'payment_reference',
        'payment_date',
        'reviewed_by',
        'review_comments',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'renewal_period_start' => 'date',
        'renewal_period_end' => 'date',
        'application_date' => 'datetime',
        'payment_date' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'is_late_renewal' => 'boolean',
        'documents_updated' => 'boolean',
        'fee_paid' => 'boolean',
        'required_ce_hours' => 'integer',
        'completed_ce_hours' => 'integer',
        'grace_period_days' => 'integer',
        'fee_amount' => 'decimal:2',
    ];

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function previousLicense()
    {
        return $this->belongsTo(License::class, 'previous_license_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function meetsRequirements(): bool
    {
        return $this->completed_ce_hours >= $this->required_ce_hours &&
               $this->documents_updated &&
               $this->fee_paid;
    }
}
