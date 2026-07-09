<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExperienceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'organization_name',
        'position',
        'location',
        'start_date',
        'end_date',
        'is_current',
        'responsibilities',
        'supervisor_name',
        'supervisor_contact',
        'document_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(LicenseApplication::class, 'application_id');
    }

    public function document()
    {
        return $this->belongsTo(ProfessionalDocument::class, 'document_id');
    }

    public function getDurationInMonths(): int
    {
        $end = $this->is_current ? now() : $this->end_date;
        return $this->start_date->diffInMonths($end);
    }
}
