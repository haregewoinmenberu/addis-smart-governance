<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchExpense extends Model
{
    protected $fillable = [
        'research_project_id',
        'category',
        'description',
        'amount',
        'expense_date',
        'vendor',
        'receipt_number',
        'payment_method',
        'status',
        'submitted_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
