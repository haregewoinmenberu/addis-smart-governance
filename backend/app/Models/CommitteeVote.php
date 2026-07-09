<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeVote extends Model
{
    protected $fillable = ['committee_review_id', 'committee_member_id', 'vote', 'comments', 'voted_at'];

    protected $casts = ['voted_at' => 'datetime'];

    public function committeeReview(): BelongsTo
    {
        return $this->belongsTo(CommitteeReview::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'committee_member_id');
    }
}
