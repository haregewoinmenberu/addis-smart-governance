<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'profession_id',
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public function applications()
    {
        return $this->hasMany(LicenseApplication::class);
    }

    public function licenses()
    {
        return $this->hasMany(License::class);
    }
}
