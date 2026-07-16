<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'amharic_name',
        'type',
        'registration_number',
        'tin_number',
        'email',
        'phone',
        'alternative_phone',
        'address',
        'city',
        'woreda',
        'website',
        'description',
        'status',
        'verified_at',
        'verified_by',
        'documents',
        'metadata',
    ];

    protected $casts = [
        'documents' => 'array',
        'metadata' => 'array',
        'verified_at' => 'datetime',
    ];

    public const TYPES = [
        'BUREAU' => 'Bureau',
        'AUTHORITY' => 'Authority',
        'COMMISSION' => 'Commission',
        'AGENCY' => 'Agency',
        'OFFICE' => 'Office',
        'WOREDA' => 'Woreda',
        'PUBLIC_ENTERPRISE' => 'Public Enterprise',
        'UNIVERSITY' => 'University',
        'COLLEGE' => 'College',
        'TVET' => 'TVET Institution',
        'SCHOOL' => 'School',
        'HOSPITAL' => 'Hospital',
        'HEALTH_CENTER' => 'Health Center',
        'HEALTH_OFFICE' => 'Health Office',
        'RESEARCH_INSTITUTE' => 'Research Institute',
        'COURT' => 'Court',
        'SECURITY' => 'Security Institution',
        'UTILITY' => 'Utility Institution',
        'NGO' => 'NGO / Development Partner',
        'COOPERATIVE' => 'Cooperative',
        'ASSOCIATION' => 'Association',
        'MANUFACTURING' => 'Manufacturing Industry',
        'FINANCIAL_INSTITUTION' => 'Financial Institution',
        'PRIVATE_COMPANY' => 'Private Company',
        'STARTUP' => 'Startup / Innovation Center',
        'RELIGIOUS_INSTITUTION' => 'Religious Institution',
        'OTHER_GOVERNMENT' => 'Other Government Institution',
        'OTHER' => 'Other',
    ];

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_SUSPENDED = 'SUSPENDED';
    public const STATUS_INACTIVE = 'INACTIVE';

    /**
     * Get the user who verified the institution.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the users for the institution.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the service form submissions for the institution.
     */
    public function serviceFormSubmissions(): HasMany
    {
        return $this->hasMany(ServiceFormSubmission::class);
    }

    /**
     * Get the documents for the institution.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(InstitutionDocument::class);
    }

    /**
     * Get the team members for the institution.
     */
    public function teamMembers(): HasMany
    {
        return $this->hasMany(InstitutionTeamMember::class);
    }

    /**
     * Get the primary contact user for the institution.
     */
    public function primaryContact()
    {
        return $this->users()->where('is_primary_contact', true)->first();
    }

    /**
     * Check if the institution is verified.
     */
    public function isVerified(): bool
    {
        return !is_null($this->verified_at) && $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if the institution is active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Verify the institution.
     */
    public function verify(User $verifier): void
    {
        $this->update([
            'verified_at' => now(),
            'verified_by' => $verifier->id,
            'status' => self::STATUS_ACTIVE,
        ]);
    }

    /**
     * Suspend the institution.
     */
    public function suspend(): void
    {
        $this->update(['status' => self::STATUS_SUSPENDED]);
    }

    /**
     * Activate the institution.
     */
    public function activate(): void
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    /**
     * Get the formatted type name.
     */
    public function getTypeNameAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    /**
     * Scope a query to only include active institutions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope a query to only include verified institutions.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Scope a query to filter by institution type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
