<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchDocument extends Model
{
    protected $fillable = [
        'research_project_id',
        'document_type',
        'title',
        'description',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'version',
        'uploaded_by',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
