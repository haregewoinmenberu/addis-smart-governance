<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstitutionDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'uploaded_by',
        'name',
        'file_path',
        'file_type',
        'file_size',
        'category',
        'description',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'file_size_formatted',
        'download_url',
    ];

    /**
     * Get the institution that owns the document.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Get the user who uploaded the document.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get formatted file size.
     */
    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            return $bytes . ' bytes';
        } elseif ($bytes == 1) {
            return $bytes . ' byte';
        } else {
            return '0 bytes';
        }
    }

    /**
     * Get download URL for the document.
     */
    public function getDownloadUrlAttribute(): string
    {
        return url('/api/institutions/documents/' . $this->id . '/download');
    }

    /**
     * Get icon for file type.
     */
    public function getIconAttribute(): string
    {
        $extension = strtolower(pathinfo($this->name, PATHINFO_EXTENSION));
        
        $iconMap = [
            'pdf' => 'file-pdf',
            'doc' => 'file-word',
            'docx' => 'file-word',
            'xls' => 'file-excel',
            'xlsx' => 'file-excel',
            'csv' => 'file-csv',
            'jpg' => 'file-image',
            'jpeg' => 'file-image',
            'png' => 'file-image',
            'gif' => 'file-image',
            'zip' => 'file-archive',
            'rar' => 'file-archive',
        ];

        return $iconMap[$extension] ?? 'file';
    }
}
