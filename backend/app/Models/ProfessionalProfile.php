<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\PracticeStatus;

class ProfessionalProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_license_id',
        'current_employer',
        'employment_type',
        'practice_location',
        'practice_city',
        'practice_region',
        'practice_address',
        'office_phone',
        'office_email',
        'specializations',
        'practice_status',
        'years_of_practice',
        'compliance_score',
        'continuing_education_hours',
        'is_public_searchable',
        'bio',
        'languages',
        'photo_path',
    ];

    protected $casts = [
        'practice_status' => PracticeStatus::class,
        'specializations' => 'array',
        'languages' => 'array',
        'years_of_practice' => 'integer',
        'continuing_education_hours' => 'integer',
        'compliance_score' => 'decimal:2',
        'is_public_searchable' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function currentLicense()
    {
        return $this->belongsTo(License::class, 'current_license_id');
    }
}
