<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceFormSubmission extends Model
{
    use HasFactory;

    protected $table = 'service_form_submissions';

    protected $fillable = [
        'institution_id',
        'service_type',
        'reference_number',
        'form_data',
        'submitted_by',
        'submitted_email',
        'submitted_name',
        'status',
        'submission_timestamp',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'form_data' => 'array',
        'submission_timestamp' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected $dates = [
        'submission_timestamp',
        'reviewed_at',
    ];

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function assignments()
    {
        return $this->hasMany(ServiceRequestAssignment::class, 'service_request_id');
    }

    public function teamLeaderAssignment()
    {
        return $this->hasOne(ServiceRequestAssignment::class, 'service_request_id')
            ->where('assignment_type', 'team_leader')
            ->latest();
    }

    public function officerAssignments()
    {
        return $this->hasMany(ServiceRequestAssignment::class, 'service_request_id')
            ->where('assignment_type', 'officer');
    }

    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
