<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\ApplicationStatus;
use App\Enums\LicenseStatus;
use App\Enums\ComplaintStatus;
use App\Enums\VerificationStatus;
use App\Models\LicenseApplication;
use App\Models\License;
use App\Models\VerificationRequest;
use App\Models\Examination;
use App\Models\Complaint;
use App\Models\DisciplinaryCase;
use Illuminate\Http\Request;

class LicensingDashboardController extends Controller
{
    /**
     * Aggregated dashboard data for the Professional Licensing domain.
     * Shared across all licensing roles; role-specific slices are added
     * for applicants (own applications) and disciplinary/verification staff.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',

            // Applications
            'total_applications' => LicenseApplication::count(),
            'pending_review' => LicenseApplication::whereIn('status', [
                ApplicationStatus::SUBMITTED,
                ApplicationStatus::UNDER_REVIEW,
            ])->count(),
            'applications_by_status' => collect(ApplicationStatus::cases())->map(fn ($s) => [
                'status' => $s->value,
                'label' => $s->label(),
                'count' => LicenseApplication::where('status', $s)->count(),
            ])->values(),

            // Licenses
            'total_licenses' => License::count(),
            'active_licenses' => License::where('status', LicenseStatus::ACTIVE)->count(),
            'licenses_by_status' => collect(LicenseStatus::cases())->map(fn ($s) => [
                'status' => $s->value,
                'label' => ucfirst($s->value),
                'count' => License::where('status', $s)->count(),
            ])->values(),

            // Verifications
            'pending_verifications' => VerificationRequest::where('status', VerificationStatus::PENDING)->count(),

            // Examinations (upcoming)
            'upcoming_examinations' => Examination::whereDate('exam_date', '>=', now())->count(),

            // Complaints
            'open_complaints' => Complaint::whereNotIn('status', [
                ComplaintStatus::RESOLVED,
                ComplaintStatus::DISMISSED,
            ])->count(),

            // Disciplinary
            'total_disciplinary_cases' => DisciplinaryCase::count(),

            // Recent activity
            'recent_applications' => LicenseApplication::with(['applicant', 'profession'])
                ->latest()->take(5)->get(),
        ];

        // Applicant: own applications
        if ($user->hasRole('professional_applicant')) {
            $stats['my_applications'] = LicenseApplication::where('applicant_id', $user->id)->count();
            $stats['my_applications_list'] = LicenseApplication::where('applicant_id', $user->id)
                ->with('profession')->latest()->take(10)->get();
        }

        // Disciplinary committee: case workload
        if ($user->hasRole('disciplinary_committee')) {
            $stats['open_cases'] = DisciplinaryCase::where('status', '!=', 'closed')->count();
            $stats['complaints_to_investigate'] = Complaint::whereIn('status', [
                ComplaintStatus::RECEIVED,
                ComplaintStatus::INVESTIGATING,
            ])->count();
        }

        // Verification officer: verification workload
        if ($user->hasRole('verification_officer')) {
            $stats['my_verifications'] = VerificationRequest::where('status', VerificationStatus::PENDING)->count();
        }

        return response()->json($stats);
    }
}
