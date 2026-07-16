<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubCity extends Model
{
    use SoftDeletes;

    protected $table = 'sub_cities';

    protected $fillable = [
        'name',
        'name_amharic',
        'code',
        'description',
        'contact_phone',
        'contact_email',
        'address',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the users associated with this sub-city.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'sub_city_id');
    }

    /**
     * Scope to get only active sub-cities.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
