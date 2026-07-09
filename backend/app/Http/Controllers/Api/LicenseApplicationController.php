<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenseApplication;
use App\Services\LicensingWorkflowService;
use App\Services\VerificationService;
use App\Enums\ApplicationStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LicenseApplicationController extends Controller
{
    protected $workflowService;
    protected $verificationService;

    public function __construct(
        LicensingWorkflowService $workflowService,
        VerificationService $verificationService
    ) {
        $this->workflowService = $workflowService;
        $this->verificationService = $verificationService;
    }

    /**
     * Get all applications
     */
    public function index(Request $request)
    {
        $query = LicenseApplication::with([
            'applicant',
            'profession',
            'specialization',
            'reviewer'
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
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('national_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $applications = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($applications);
    }

    /**
     * Create new application
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'profession_id' => 'required|exists:professions,id',
            'specialization_id' => 'nullable|exists:specializations,id',
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string',
            'national_id' => 'required|string|unique:license_applications,national_id',
            'passport_number' => 'nullable|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'region' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'nullable|string',
            'qualification_level' => 'required|string',
            'educational_institution' => 'required|string',
            'graduation_year' => 'required|integer|min:1950|max:' . date('Y'),
            'experience_years' => 'required|integer|min:0',
            'previous_license_number' => 'nullable|string',
            'previous_license_country' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $validated['application_number'] = $this->generateApplicationNumber();
            $validated['applicant_id'] = $request->user()->id;
            $validated['status'] = ApplicationStatus::DRAFT;

            $application = LicenseApplication::create($validated);

            DB::commit();

            return response()->json([
                'message' => 'Application created successfully',
                'application' => $application->load(['profession', 'specialization']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create application'], 500);
        }
    }

    /**
     * Get single application
     */
    public function show($id)
    {
        $application = LicenseApplication::with([
            'applicant',
            'profession',
            'specialization',
            'reviewer',
            'documents',
            'educationRecords',
            'experienceRecords',
            'verificationRequests.verifier',
            'examAttempts.examination',
            'workflowHistory.user'
        ])->findOrFail($id);

        // Get verification summary
        $verificationSummary = $this->verificationService->getVerificationSummary($application);

        return response()->json([
            'application' => $application,
            'verification_summary' => $verificationSummary,
        ]);
    }

    /**
     * Update application
     */
    public function update(Request $request, $id)
    {
        $application = LicenseApplication::findOrFail($id);

        if (!$application->canSubmit()) {
            return response()->json(['error' => 'Cannot update submitted application'], 422);
        }

        $validated = $request->validate([
            'profession_id' => 'sometimes|exists:professions,id',
            'specialization_id' => 'nullable|exists:specializations,id',
            'full_name' => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|string',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|string',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'region' => 'sometimes|string',
            'qualification_level' => 'sometimes|string',
            'educational_institution' => 'sometimes|string',
            'graduation_year' => 'sometimes|integer',
            'experience_years' => 'sometimes|integer',
        ]);

        $application->update($validated);

        return response()->json([
            'message' => 'Application updated successfully',
            'application' => $application,
        ]);
    }

    /**
     * Submit application
     */
    public function submit($id)
    {
        $application = LicenseApplication::findOrFail($id);

        if (!$application->isComplete()) {
            return response()->json([
                'error' => 'Application is incomplete. Please upload required documents.'
            ], 422);
        }

        $success = $this->workflowService->submitApplication($application, auth()->id());

        if (!$success) {
            return response()->json(['error' => 'Cannot submit application'], 422);
        }

        // Create verification requests
        $this->verificationService->createVerificationRequests($application);

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application->fresh(),
        ]);
    }

    /**
     * Start review
     */
    public function startReview($id)
    {
        $application = LicenseApplication::findOrFail($id);

        $success = $this->workflowService->startReview($application, auth()->id());

        if (!$success) {
            return response()->json(['error' => 'Cannot start review'], 422);
        }

        return response()->json([
            'message' => 'Review started',
            'application' => $application->fresh(),
        ]);
    }

    /**
     * Approve application
     */
    public function approve(Request $request, $id)
    {
        $application = LicenseApplication::findOrFail($id);

        $validated = $request->validate([
            'comments' => 'nullable|string',
        ]);

        $success = $this->workflowService->approveApplication(
            $application,
            auth()->id(),
            $validated['comments'] ?? null
        );

        if (!$success) {
            return response()->json(['error' => 'Cannot approve application'], 422);
        }

        return response()->json([
            'message' => 'Application approved successfully',
            'application' => $application->fresh(),
        ]);
    }

    /**
     * Reject application
     */
    public function reject(Request $request, $id)
    {
        $application = LicenseApplication::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $success = $this->workflowService->rejectApplication(
            $application,
            auth()->id(),
            $validated['reason']
        );

        if (!$success) {
            return response()->json(['error' => 'Cannot reject application'], 422);
        }

        return response()->json([
            'message' => 'Application rejected',
            'application' => $application->fresh(),
        ]);
    }

    /**
     * Return for correction
     */
    public function returnForCorrection(Request $request, $id)
    {
        $application = LicenseApplication::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $success = $this->workflowService->returnForCorrection(
            $application,
            auth()->id(),
            $validated['reason']
        );

        return response()->json([
            'message' => 'Application returned for correction',
            'application' => $application->fresh(),
        ]);
    }

    /**
     * Delete application
     */
    public function destroy($id)
    {
        $application = LicenseApplication::findOrFail($id);

        if (!$application->canSubmit()) {
            return response()->json(['error' => 'Cannot delete submitted application'], 422);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted successfully']);
    }

    /**
     * Get application statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => LicenseApplication::count(),
            'by_status' => [],
            'recent' => LicenseApplication::latest()->take(5)->get(),
        ];

        foreach (ApplicationStatus::cases() as $status) {
            $stats['by_status'][$status->value] = [
                'count' => LicenseApplication::where('status', $status)->count(),
                'label' => $status->label(),
                'color' => $status->color(),
            ];
        }

        return response()->json($stats);
    }

    /**
     * Generate application number
     */
    protected function generateApplicationNumber(): string
    {
        $year = now()->format('Y');
        $random = strtoupper(Str::random(6));
        return "APP-{$year}-{$random}";
    }
}
