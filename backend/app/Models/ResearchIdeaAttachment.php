<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchIdeaAttachment extends Model
{
    protected $fillable = [
        'research_idea_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
    ];

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
