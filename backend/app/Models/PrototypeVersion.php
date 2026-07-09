<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrototypeVersion extends Model
{
    protected $fillable = [
        'research_project_id',
        'version_number',
        'title',
        'description',
        'features',
        'improvements',
        'known_issues',
        'status',
        'release_date',
        'created_by',
    ];

    protected $casts = [
        'release_date' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
