<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ExamResult;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'examination_id',
        'application_id',
        'candidate_id',
        'attempt_number',
        'started_at',
        'submitted_at',
        'score',
        'total_marks',
        'passing_marks',
        'result',
        'evaluator_id',
        'evaluator_comments',
        'evaluated_at',
        'is_appeal',
        'appeal_reason',
    ];

    protected $casts = [
        'result' => ExamResult::class,
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'evaluated_at' => 'datetime',
        'is_appeal' => 'boolean',
        'score' => 'integer',
        'total_marks' => 'integer',
        'passing_marks' => 'integer',
        'attempt_number' => 'integer',
    ];

    public function examination()
    {
        return $this->belongsTo(Examination::class);
    }

    public function application()
    {
        return $this->belongsTo(LicenseApplication::class, 'application_id');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function calculateResult(): void
    {
        if ($this->score === null) return;
        
        $this->result = $this->score >= $this->passing_marks ? ExamResult::PASS : ExamResult::FAIL;
        $this->save();
    }

    public function getPercentage(): float
    {
        if ($this->total_marks === 0) return 0;
        return ($this->score / $this->total_marks) * 100;
    }
}
