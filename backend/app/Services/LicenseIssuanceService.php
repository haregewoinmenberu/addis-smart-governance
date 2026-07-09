<?php

namespace App\Services;

use App\Models\LicenseApplication;
use App\Models\License;
use App\Models\ProfessionalProfile;
use App\Enums\LicenseStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LicenseIssuanceService
{
    /**
     * Issue license from approved application
     */
    public function issueLicense(LicenseApplication $application, $issuerId): License
    {
        DB::beginTransaction();
        try {
            $profession = $application->profession;
            
            $license = License::create([
                'license_number' => $this->generateLicenseNumber($profession->code),
                'application_id' => $application->id,
                'professional_id' => $application->applicant_id,
                'profession_id' => $application->profession_id,
                'specialization_id' => $application->specialization_id,
                'issue_date' => now(),
                'expiry_date' => now()->addYears($profession->license_validity_years),
                'status' => LicenseStatus::ACTIVE,
                'qr_code' => $this->generateQRCode(),
                'issued_by' => $issuerId,
            ]);

            // Generate digital certificate
            $this->generateCertificate($license);

            // Create or update professional profile
            $this->createProfessionalProfile($application->applicant_id, $license->id);

            DB::commit();
            return $license;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generate unique license number
     */
    protected function generateLicenseNumber(string $professionCode): string
    {
        $year = now()->format('Y');
        $random = strtoupper(Str::random(6));
        return "{$professionCode}-{$year}-{$random}";
    }

    /**
     * Generate QR code for verification
     */
    protected function generateQRCode(): string
    {
        return Str::uuid()->toString();
    }

    /**
     * Generate digital certificate PDF
     */
    protected function generateCertificate(License $license): void
    {
        // TODO: Implement PDF generation using DOMPDF or similar
        // This would generate a professional license certificate with:
        // - License holder information
        // - License number and QR code
        // - Issue and expiry dates
        // - Digital signature
        // - Authority seal
        
        $certificatePath = "licenses/certificates/{$license->license_number}.pdf";
        $license->update(['certificate_path' => $certificatePath]);
    }

    /**
     * Create professional profile
     */
    protected function createProfessionalProfile($userId, $licenseId): void
    {
        ProfessionalProfile::updateOrCreate(
            ['user_id' => $userId],
            [
                'current_license_id' => $licenseId,
                'practice_status' => 'active',
            ]
        );
    }

    /**
     * Renew license
     */
    public function renewLicense(License $oldLicense, $issuerId): License
    {
        DB::beginTransaction();
        try {
            // Mark old license as expired
            $oldLicense->update(['status' => LicenseStatus::EXPIRED]);

            $profession = $oldLicense->profession;
            
            // Create new license
            $newLicense = License::create([
                'license_number' => $this->generateLicenseNumber($profession->code),
                'application_id' => $oldLicense->application_id,
                'professional_id' => $oldLicense->professional_id,
                'profession_id' => $oldLicense->profession_id,
                'specialization_id' => $oldLicense->specialization_id,
                'issue_date' => now(),
                'expiry_date' => now()->addYears($profession->license_validity_years),
                'status' => LicenseStatus::ACTIVE,
                'qr_code' => $this->generateQRCode(),
                'issued_by' => $issuerId,
            ]);

            // Generate new certificate
            $this->generateCertificate($newLicense);

            // Update professional profile
            ProfessionalProfile::where('user_id', $newLicense->professional_id)
                ->update(['current_license_id' => $newLicense->id]);

            DB::commit();
            return $newLicense;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Verify license by license number
     */
    public function verifyLicense(string $licenseNumber): ?array
    {
        $license = License::with(['professional', 'profession', 'specialization'])
            ->where('license_number', $licenseNumber)
            ->first();

        if (!$license) {
            return null;
        }

        return [
            'license_number' => $license->license_number,
            'status' => $license->status->label(),
            'professional_name' => $license->professional->name,
            'profession' => $license->profession->name,
            'specialization' => $license->specialization?->name,
            'issue_date' => $license->issue_date->format('Y-m-d'),
            'expiry_date' => $license->expiry_date->format('Y-m-d'),
            'is_valid' => $license->isActive() && !$license->isExpired(),
            'days_until_expiry' => $license->daysUntilExpiry(),
        ];
    }

    /**
     * Verify license by QR code
     */
    public function verifyByQRCode(string $qrCode): ?array
    {
        $license = License::where('qr_code', $qrCode)->first();
        
        if (!$license) {
            return null;
        }

        return $this->verifyLicense($license->license_number);
    }
}
