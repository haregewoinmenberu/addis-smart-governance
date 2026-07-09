<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchTeamMember extends Model
{
    protected $fillable = [
        'research_project_id',
        'user_id',
        'role',
        'responsibilities',
        'joined_date',
        'left_date',
        'is_active',
    ];

    protected $casts = [
        'joined_date' => 'date',
        'left_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
