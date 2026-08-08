<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchIdeaAttachment extends Model
{
    protected $fillable = [
        'research_idea_id',
        'workflow_progress_id',
        'field_name',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'edited_by',
        'edited_at',
    ];

    protected $casts = [
        'edited_at' => 'datetime',
    ];

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function workflowProgress()
    {
        return $this->belongsTo(ResearchWorkflowProgress::class, 'workflow_progress_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function lastEditor()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    public function versions()
    {
        return $this->hasMany(ResearchAttachmentVersion::class, 'attachment_id')->orderBy('version_number', 'desc');
    }

    public function currentVersion()
    {
        return $this->hasOne(ResearchAttachmentVersion::class, 'attachment_id')->where('is_current', true);
    }
}
