<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\LicenseApplication;
use App\Services\LicenseIssuanceService;
use App\Services\LicensingWorkflowService;
use App\Enums\LicenseStatus;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    protected $issuanceService;
    protected $workflowService;

    public function __construct(
        LicenseIssuanceService $issuanceService,
        LicensingWorkflowService $workflowService
    ) {
        $this->issuanceService = $issuanceService;
        $this->workflowService = $workflowService;
    }

    /**
     * Get all licenses
     */
    public function index(Request $request)
    {
        $query = License::with([
            'professional',
            'profession',
            'specialization',
            'issuer'
        ]);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('profession_id')) {
            $query->where('profession_id', $request->profession_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('license_number', 'like', "%{$search}%")
                  ->orWhereHas('professional', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('expiring_soon')) {
            $query->where('expiry_date', '<=', now()->addDays(90))
                  ->where('expiry_date', '>=', now())
                  ->where('status', LicenseStatus::ACTIVE);
        }

        $licenses = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($licenses);
    }

    /**
     * Issue new license
     */
    public function issue(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:license_applications,id',
        ]);

        $application = LicenseApplication::findOrFail($validated['application_id']);

        if ($application->status->value !== 'approved') {
            return response()->json(['error' => 'Application must be approved first'], 422);
        }

        if ($application->license) {
            return response()->json(['error' => 'License already issued'], 422);
        }

        try {
            $license = $this->issuanceService->issueLicense($application, auth()->id());

            return response()->json([
                'message' => 'License issued successfully',
                'license' => $license->load(['professional', 'profession', 'specialization']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to issue license: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get single license
     */
    public function show($id)
    {
        $license = License::with([
            'professional',
            'profession',
            'specialization',
            'issuer',
            'application',
            'renewals',
            'suspensions',
            'revocation',
            'workflowHistory.user'
        ])->findOrFail($id);

        return response()->json([
            'license' => $license,
            'is_active' => $license->isActive(),
            'is_expired' => $license->isExpired(),
            'days_until_expiry' => $license->daysUntilExpiry(),
            'is_eligible_for_renewal' => $license->isEligibleForRenewal(),
        ]);
    }

    /**
     * Verify license by license number
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'license_number' => 'required|string',
        ]);

        $verificationResult = $this->issuanceService->verifyLicense($validated['license_number']);

        if (!$verificationResult) {
            return response()->json(['error' => 'License not found'], 404);
        }

        return response()->json($verificationResult);
    }

    /**
     * Verify by QR code
     */
    public function verifyQR(Request $request)
    {
        $validated = $request->validate([
            'qr_code' => 'required|string',
        ]);

        $verificationResult = $this->issuanceService->verifyByQRCode($validated['qr_code']);

        if (!$verificationResult) {
            return response()->json(['error' => 'License not found'], 404);
        }

        return response()->json($verificationResult);
    }

    /**
     * Suspend license
     */
    public function suspend(Request $request, $id)
    {
        $license = License::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $success = $this->workflowService->suspendLicense(
            $license,
            auth()->id(),
            $validated['reason']
        );

        if (!$success) {
            return response()->json(['error' => 'Failed to suspend license'], 422);
        }

        return response()->json([
            'message' => 'License suspended successfully',
            'license' => $license->fresh(),
        ]);
    }

    /**
     * Reactivate license
     */
    public function reactivate($id)
    {
        $license = License::findOrFail($id);

        if ($license->status !== LicenseStatus::SUSPENDED) {
            return response()->json(['error' => 'Only suspended licenses can be reactivated'], 422);
        }

        $success = $this->workflowService->activateLicense($license, auth()->id());

        return response()->json([
            'message' => 'License reactivated successfully',
            'license' => $license->fresh(),
        ]);
    }

    /**
     * Revoke license
     */
    public function revoke(Request $request, $id)
    {
        $license = License::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $success = $this->workflowService->revokeLicense(
            $license,
            auth()->id(),
            $validated['reason']
        );

        return response()->json([
            'message' => 'License revoked successfully',
            'license' => $license->fresh(),
        ]);
    }

    /**
     * Get license statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => License::count(),
            'by_status' => [],
            'expiring_soon' => License::where('expiry_date', '<=', now()->addDays(90))
                ->where('expiry_date', '>=', now())
                ->where('status', LicenseStatus::ACTIVE)
                ->count(),
            'expired' => License::where('status', LicenseStatus::EXPIRED)->count(),
        ];

        foreach (LicenseStatus::cases() as $status) {
            $stats['by_status'][$status->value] = [
                'count' => License::where('status', $status)->count(),
                'label' => $status->label(),
                'color' => $status->color(),
            ];
        }

        return response()->json($stats);
    }

    /**
     * Download license certificate
     */
    public function downloadCertificate($id)
    {
        $license = License::findOrFail($id);

        if (!$license->certificate_path) {
            return response()->json(['error' => 'Certificate not available'], 404);
        }

        // TODO: Return file download
        return response()->json(['message' => 'Certificate download functionality to be implemented']);
    }
}
