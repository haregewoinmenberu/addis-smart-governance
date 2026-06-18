<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\ServiceFormSubmission;
use App\Http\Controllers\Controller;

class ServiceFormSubmissionController extends Controller
{
    /**
     * Submit a service form for any of the STRP modules
     */
    public function submitForm(Request $request)
    {
        try {
            $serviceType = $request->input('serviceType');
            $formData = $request->input('formData', []);

            // Validate service type
            $validServiceTypes = ['research', 'transformation', 'licensing', 'lms'];
            if (!in_array($serviceType, $validServiceTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid service type',
                    'errors' => ['serviceType' => ['The service type must be one of: ' . implode(', ', $validServiceTypes)]]
                ], 422);
            }

            // Validate based on service type
            $this->validateFormData($serviceType, $formData);

            // Create submission record
            $submission = ServiceFormSubmission::create([
                'service_type' => $serviceType,
                'reference_number' => 'STRP-' . strtoupper(Str::random(6)),
                'form_data' => $formData,
                'submitted_by' => auth()->user()?->id,
                'submitted_email' => $formData['email'] ?? null,
                'submitted_name' => $formData['fullName'] ?? null,
                'status' => 'pending',
                'submission_timestamp' => now(),
            ]);

            // Log the submission for audit trail
            activity()
                ->causedBy(auth()->user())
                ->performedOn($submission)
                ->withProperties(['service_type' => $serviceType])
                ->log('Service form submitted');

            // Send confirmation email
            // TODO: Implement email notification
            // Mail::send(new ServiceFormSubmissionConfirmation($submission));

            // Queue background job for processing if needed
            // TODO: Dispatch job to process the form based on service type

            return response()->json([
                'success' => true,
                'message' => ucfirst($serviceType) . ' proposal submitted successfully',
                'data' => [
                    'reference_number' => $submission->reference_number,
                    'status' => $submission->status,
                    'submission_timestamp' => $submission->submission_timestamp,
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Service form submission error: ' . $e->getMessage(), [
                'exception' => $e,
                'service_type' => $request->input('serviceType'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your form. Please try again.',
            ], 500);
        }
    }

    /**
     * Get submission status
     */
    public function getSubmissionStatus($referenceNumber)
    {
        $submission = ServiceFormSubmission::where('reference_number', $referenceNumber)->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'reference_number' => $submission->reference_number,
                'service_type' => $submission->service_type,
                'status' => $submission->status,
                'submitted_at' => $submission->submission_timestamp,
                'updated_at' => $submission->updated_at,
            ]
        ]);
    }

    /**
     * List user's submissions
     */
    public function listUserSubmissions(Request $request)
    {
        $query = ServiceFormSubmission::where('submitted_email', $request->user()->email)
            ->orWhere('submitted_by', $request->user()->id);

        $submissions = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $submissions->items(),
            'pagination' => [
                'total' => $submissions->total(),
                'current_page' => $submissions->current_page(),
                'last_page' => $submissions->last_page(),
                'per_page' => $submissions->per_page(),
            ]
        ]);
    }

    /**
     * Validate form data based on service type
     */
    private function validateFormData(string $serviceType, array $formData)
    {
        switch ($serviceType) {
            case 'research':
                $this->validateResearchForm($formData);
                break;
            case 'transformation':
                $this->validateTransformationForm($formData);
                break;
            case 'licensing':
                $this->validateLicensingForm($formData);
                break;
            case 'lms':
                $this->validateLmsForm($formData);
                break;
        }
    }

    /**
     * Validate research form data
     */
    private function validateResearchForm(array $formData)
    {
        $rules = [
            'fullName' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'researchTitle' => 'required|string|max:255',
            'category' => 'required|string|in:AI & Data,Cybersecurity,Infrastructure,Policy,Other',
            'abstract' => 'required|string|max:2000',
            'estimatedBudget' => 'required|string',
            'durationMonths' => 'required|integer|min:1|max:60',
            'agree' => 'required|boolean|accepted',
        ];

        $this->validate(request()->merge(['formData' => $formData])->all(), ['formData.*' => 'required']);
    }

    /**
     * Validate transformation form data
     */
    private function validateTransformationForm(array $formData)
    {
        // Add transformation-specific validation rules
        $rules = [
            'organizationName' => 'required|string|max:255',
            'contactPerson' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'systemsToModernize' => 'required|string',
            'timeline' => 'required|string',
            'budget' => 'required|string',
            'priorities' => 'required|string',
            'agree' => 'required|boolean|accepted',
        ];
    }

    /**
     * Validate licensing form data
     */
    private function validateLicensingForm(array $formData)
    {
        $rules = [
            'fullName' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string',
            'experience' => 'required|string',
            'education' => 'required|string',
            'applicationType' => 'required|string|in:individual,vendor',
            'agree' => 'required|boolean|accepted',
        ];
    }

    /**
     * Validate LMS form data
     */
    private function validateLmsForm(array $formData)
    {
        $rules = [
            'organizationName' => 'required|string|max:255',
            'contactPerson' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'numberOfEmployees' => 'required|integer|min:1',
            'trainingNeeds' => 'required|string',
            'budget' => 'required|string',
            'agree' => 'required|boolean|accepted',
        ];
    }
}
