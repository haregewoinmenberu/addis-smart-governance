<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessionalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'document_type',
        'document_name',
        'file_path',
        'file_type',
        'file_size',
        'issuing_authority',
        'issue_date',
        'expiry_date',
        'notes',
        'is_verified',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(LicenseApplication::class, 'application_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function educationRecords()
    {
        return $this->hasMany(EducationalRecord::class, 'document_id');
    }

    public function experienceRecords()
    {
        return $this->hasMany(ExperienceRecord::class, 'document_id');
    }
}
