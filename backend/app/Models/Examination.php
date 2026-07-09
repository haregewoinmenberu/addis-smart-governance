<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examination extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_code',
        'profession_id',
        'exam_title',
        'description',
        'duration_minutes',
        'total_marks',
        'passing_marks',
        'exam_date',
        'start_time',
        'exam_center',
        'exam_location',
        'supervisor_id',
        'max_candidates',
        'is_active',
    ];

    protected $casts = [
        'exam_date' => 'date',
        'is_active' => 'boolean',
        'duration_minutes' => 'integer',
        'total_marks' => 'integer',
        'passing_marks' => 'integer',
        'max_candidates' => 'integer',
    ];

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function questions()
    {
        return $this->hasMany(ExamQuestion::class);
    }

    public function attempts()
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function getAvailableSeats(): int
    {
        if (!$this->max_candidates) {
            return PHP_INT_MAX;
        }
        
        return max(0, $this->max_candidates - $this->attempts()->count());
    }

    public function getPassPercentage(): float
    {
        $total = $this->attempts()->whereNotNull('result')->count();
        if ($total === 0) return 0;
        
        $passed = $this->attempts()->where('result', 'pass')->count();
        return ($passed / $total) * 100;
    }
}
