<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnologyDocument extends Model
{
    protected $fillable = [
        'technology_request_id', 'document_type', 'file_name', 'file_path', 'file_type', 'file_size', 'uploaded_by'
    ];

    public function technologyRequest(): BelongsTo
    {
        return $this->belongsTo(TechnologyRequest::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
