<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContinuingEducation extends Model
{
    use HasFactory;

    protected $table = 'continuing_education';

    protected $fillable = [
        'professional_id',
        'license_id',
        'course_title',
        'provider',
        'course_type',
        'completion_date',
        'hours',
        'credits',
        'certificate_number',
        'is_verified',
        'verified_by',
        'verified_at',
        'document_path',
    ];

    protected $casts = [
        'completion_date' => 'date',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'hours' => 'integer',
        'credits' => 'integer',
    ];

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
