<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'examination_id',
        'question_type',
        'question_text',
        'options',
        'correct_answer',
        'marks',
        'order',
    ];

    protected $casts = [
        'options' => 'array',
        'marks' => 'integer',
        'order' => 'integer',
    ];

    public function examination()
    {
        return $this->belongsTo(Examination::class);
    }
}
