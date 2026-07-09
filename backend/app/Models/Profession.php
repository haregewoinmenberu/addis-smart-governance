<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'requires_exam',
        'license_validity_years',
        'renewal_grace_period_days',
        'continuing_education_hours',
        'is_active',
    ];

    protected $casts = [
        'requires_exam' => 'boolean',
        'is_active' => 'boolean',
        'license_validity_years' => 'integer',
        'renewal_grace_period_days' => 'integer',
        'continuing_education_hours' => 'integer',
    ];

    public function specializations()
    {
        return $this->hasMany(Specialization::class);
    }

    public function applications()
    {
        return $this->hasMany(LicenseApplication::class);
    }

    public function licenses()
    {
        return $this->hasMany(License::class);
    }

    public function examinations()
    {
        return $this->hasMany(Examination::class);
    }
}
