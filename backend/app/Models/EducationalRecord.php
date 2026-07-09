<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'degree_type',
        'field_of_study',
        'institution_name',
        'country',
        'graduation_year',
        'grade_gpa',
        'document_id',
    ];

    protected $casts = [
        'graduation_year' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(LicenseApplication::class, 'application_id');
    }

    public function document()
    {
        return $this->belongsTo(ProfessionalDocument::class, 'document_id');
    }
}
