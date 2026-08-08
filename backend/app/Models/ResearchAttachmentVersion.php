<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchAttachmentVersion extends Model
{
    protected $fillable = [
        'attachment_id',
        'version_number',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'uploaded_by',
        'version_notes',
        'is_current',
    ];

    protected $casts = [
        'is_current' => 'boolean',
    ];

    public function attachment()
    {
        return $this->belongsTo(ResearchIdeaAttachment::class, 'attachment_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
