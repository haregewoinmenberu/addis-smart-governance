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
            $formDataJson = $request->input('formData');
            $formData = is_string($formDataJson) ? json_decode($formDataJson, true) : $formDataJson;
 
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

            // Handle file uploads
            $fileAttachments = [];
            
            // Single file upload for research (supportingLetter)
            if ($serviceType === 'research' && $request->hasFile('supportingLetter')) {
                $file = $request->file('supportingLetter');
                $path = $file->store('service-forms/research', 'public');
                $fileAttachments['supportingLetter'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
                \Log::info('Supporting letter uploaded', ['path' => $path]);
            }
            
            // Single file upload for transformation (officialLetter)
            if ($serviceType === 'transformation' && $request->hasFile('officialLetter')) {
                $file = $request->file('officialLetter');
                $path = $file->store('service-forms/transformation', 'public');
                $fileAttachments['officialLetter'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
                \Log::info('Official letter uploaded', ['path' => $path]);
            }
            
            // Multiple file upload for licensing (documents)
            if ($serviceType === 'licensing') {
                $fileAttachments['documents'] = [];
                $documentIndex = 0;
                
                while ($request->hasFile("documents[{$documentIndex}]")) {
                    $file = $request->file("documents[{$documentIndex}]");
                    $path = $file->store('service-forms/licensing', 'public');
                    $fileAttachments['documents'][] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ];
                    $documentIndex++;
                }
                \Log::info('Documents uploaded', ['count' => count($fileAttachments['documents'])]);
            }

            // Merge file attachments with form data
            if (!empty($fileAttachments)) {
                $formData['attachments'] = $fileAttachments;
            }

            // Generate reference number with service type prefix
            $referencePrefix = match($serviceType) {
                'research' => 'RSH',
                'transformation' => 'TTR',
                'licensing' => 'LIC',
                'lms' => 'LMS',
                default => 'SRV'
            };
            
            $referenceNumber = $referencePrefix . '-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            // Create submission record
            $submission = ServiceFormSubmission::create([
                'service_type' => $serviceType,
                'reference_number' => $referenceNumber,
                'form_data' => $formData,
                'submitted_by' => auth()->user()?->id,
                'submitted_email' => $formData['email'] ?? null,
                'submitted_name' => $formData['fullName'] ?? $formData['agencyName'] ?? null,
                'status' => 'pending',
                'submission_timestamp' => now(),
            ]);

            \Log::info('Service form submitted successfully', [
                'service_type' => $serviceType,
                'reference_number' => $referenceNumber,
                'submission_id' => $submission->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => ucfirst($serviceType) . ' form submitted successfully',
                'data' => [
                    'reference_number' => $submission->reference_number,
                    'status' => $submission->status,
                    'submission_timestamp' => $submission->submission_timestamp,
                ]
            ], 201);

        } catch (ValidationException $e) {
            \Log::warning('Service form validation failed', [
                'errors' => $e->errors(),
                'service_type' => $request->input('serviceType'),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Service form submission error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'service_type' => $request->input('serviceType'),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your form. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
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
     * List ALL submissions (admin/command center view)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = ServiceFormSubmission::query()
            ->with(['submittedBy', 'reviewedBy', 'institution']);

        // Check if user has management capabilities (can assign to others)
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        
        // Filter based on user access:
        // 1. Users with management access see ALL submissions (they can assign to others)
        // 2. Users without management access see:
        //    - Submissions assigned to them via reviewed_by
        //    - Submissions where they have assignments (team leader or officer)
        if (!$hasManagementAccess) {
            $query->where(function($q) use ($user) {
                $q->where('reviewed_by', $user->id)
                  ->orWhereHas('assignments', function($assignQuery) use ($user) {
                      $assignQuery->where('assigned_to', $user->id)
                                  ->whereIn('status', ['pending', 'accepted', 'in_progress']);
                  });
            });
        }
        // If user has management access, no filtering needed - they see all

        // Apply additional filters
        if ($request->has('service_type') && $request->service_type) {
            $query->byServiceType($request->service_type);
        }
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('submitted_name', 'like', "%{$search}%")
                  ->orWhere('submitted_email', 'like', "%{$search}%");
            });
        }
        if ($request->has('assigned_to') && $request->assigned_to) {
            $query->where('reviewed_by', $request->assigned_to);
        }

        $submissions = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $submissions->items(),
            'pagination' => [
                'total' => $submissions->total(),
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'per_page' => $submissions->perPage(),
            ]
        ]);
    }

    /**
     * Assign a submission to a user for review/handling
     */
    public function assign(Request $request, $id)
    {
        $validator = validator($request->all(), [
            'assigned_to' => 'required|integer|exists:users,id',
            'notes'       => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        $submission = ServiceFormSubmission::findOrFail($id);
        $submission->update([
            'reviewed_by' => $request->assigned_to,
            'review_notes' => $request->notes
                ? ($submission->review_notes ? $submission->review_notes . "\n" . $request->notes : $request->notes)
                : $submission->review_notes,
        ]);

        \Log::info('Submission assigned', [
            'submission_id' => $id,
            'assigned_to'   => $request->assigned_to,
            'assigned_by'   => $request->user()?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Submission assigned successfully',
            'data'    => $submission->fresh()->load(['submittedBy', 'reviewedBy']),
        ]);
    }

    /**
     * Review/update status of a submission
     */
    public function review(Request $request, $id)
    {
        $validator = validator($request->all(), [
            'status'       => 'required|string|in:pending,under_review,approved,rejected',
            'review_notes' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $submission = ServiceFormSubmission::findOrFail($id);
        
        // Check if user has permission to review:
        // 1. Users with management access can review any submission
        // 2. Users assigned to the submission can review it
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        $isAssignedToSubmission = $submission->reviewed_by == $user->id;
        
        if (!$hasManagementAccess && !$isAssignedToSubmission) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to review this submission',
            ], 403);
        }
        
        $submission->update([
            'status'       => $request->status,
            'review_notes' => $request->review_notes,
            'reviewed_at'  => now(),
        ]);

        \Log::info('Submission reviewed', [
            'submission_id' => $id,
            'status'        => $request->status,
            'reviewed_by'   => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Submission status updated',
            'data'    => $submission->fresh()->load(['submittedBy', 'reviewedBy']),
        ]);
    }

    /**
     * List user's submissions
     */
    public function listUserSubmissions(Request $request)
    {
        $user = $request->user();
        
        $query = ServiceFormSubmission::query()
            ->where(function($q) use ($user) {
                $q->where('submitted_email', $user->email)
                  ->orWhere('submitted_by', $user->id);
                  
                // If user has institution_id, also fetch institution submissions
                if ($user->institution_id) {
                    $q->orWhere('institution_id', $user->institution_id);
                }
            })
            ->with(['submittedBy', 'reviewedBy']);

        // Filter by service type if provided
        if ($request->has('service_type')) {
            $query->byServiceType($request->service_type);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $submissions = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $submissions->items(),
            'pagination' => [
                'total' => $submissions->total(),
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'per_page' => $submissions->perPage(),
            ]
        ]);
    }

    /**
     * Get a single submission detail (for authenticated user)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        // Check if user has management capabilities (can assign service requests)
        $hasManagementAccess = \App\Services\RoleHierarchyService::hasUserManagementCapability($user);
        
        // If user has management access, they can view any submission
        if ($hasManagementAccess) {
            $submission = ServiceFormSubmission::with(['submittedBy', 'reviewedBy'])
                ->where('id', $id)
                ->first();
        } else {
            // Users without management access can only view submissions assigned to them
            $submission = ServiceFormSubmission::with(['submittedBy', 'reviewedBy'])
                ->where('id', $id)
                ->where('reviewed_by', $user->id)
                ->first();
        }

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found or access denied',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $submission
        ]);
    }

    /**
     * Create a new submission (authenticated)
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $serviceType = $request->input('serviceType');
            $formDataJson = $request->input('formData');
            $formData = is_string($formDataJson) ? json_decode($formDataJson, true) : $formDataJson;

            // Validate service type
            $validServiceTypes = ['research', 'transformation', 'licensing'];
            if (!in_array($serviceType, $validServiceTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid service type',
                    'errors' => ['serviceType' => ['The service type must be one of: ' . implode(', ', $validServiceTypes)]]
                ], 422);
            }

            // Validate based on service type
            $this->validateFormData($serviceType, $formData);

            // Handle file uploads
            $fileAttachments = [];
            
            if ($serviceType === 'research' && $request->hasFile('supportingLetter')) {
                $file = $request->file('supportingLetter');
                $path = $file->store('service-forms/research', 'public');
                $fileAttachments['supportingLetter'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }
            
            if ($serviceType === 'transformation' && $request->hasFile('officialLetter')) {
                $file = $request->file('officialLetter');
                $path = $file->store('service-forms/transformation', 'public');
                $fileAttachments['officialLetter'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }
            
            if ($serviceType === 'licensing') {
                $fileAttachments['documents'] = [];
                $documentIndex = 0;
                
                while ($request->hasFile("documents[{$documentIndex}]")) {
                    $file = $request->file("documents[{$documentIndex}]");
                    $path = $file->store('service-forms/licensing', 'public');
                    $fileAttachments['documents'][] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ];
                    $documentIndex++;
                }
            }

            if (!empty($fileAttachments)) {
                $formData['attachments'] = $fileAttachments;
            }

            // Generate reference number
            $referencePrefix = match($serviceType) {
                'research' => 'RSH',
                'transformation' => 'TTR',
                'licensing' => 'LIC',
                default => 'SRV'
            };
            
            $referenceNumber = $referencePrefix . '-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            // Create submission record
            $submission = ServiceFormSubmission::create([
                'institution_id' => $user->institution_id,
                'service_type' => $serviceType,
                'reference_number' => $referenceNumber,
                'form_data' => $formData,
                'submitted_by' => $user->id,
                'submitted_email' => $user->email,
                'submitted_name' => $user->name,
                'status' => 'pending',
                'submission_timestamp' => now(),
            ]);

            \Log::info('Authenticated service form submitted', [
                'service_type' => $serviceType,
                'reference_number' => $referenceNumber,
                'submitted_by' => $user->id,
                'institution_id' => $user->institution_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => ucfirst($serviceType) . ' request submitted successfully',
                'data' => $submission
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Authenticated service form submission error: ' . $e->getMessage(), [
                'exception' => $e,
                'service_type' => $request->input('serviceType'),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your request. Please try again.',
            ], 500);
        }
    }

    /**
     * Update an existing submission (only if pending)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            $submission = ServiceFormSubmission::where('id', $id)
                ->where(function($q) use ($user) {
                    $q->where('submitted_by', $user->id);
                    if ($user->institution_id) {
                        $q->orWhere('institution_id', $user->institution_id);
                    }
                })
                ->first();

            if (!$submission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Submission not found or access denied',
                ], 404);
            }

            // Only allow updates for pending submissions
            if ($submission->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update a submission that has already been reviewed',
                ], 403);
            }

            $formDataJson = $request->input('formData');
            $formData = is_string($formDataJson) ? json_decode($formDataJson, true) : $formDataJson;

            // Validate based on service type
            $this->validateFormData($submission->service_type, $formData);

            // Handle file uploads — preserve any existing attachments and merge new ones
            $existingAttachments = $submission->form_data['attachments'] ?? [];
            $fileAttachments = $existingAttachments;

            if ($submission->service_type === 'research' && $request->hasFile('supportingLetter')) {
                $file = $request->file('supportingLetter');
                $path = $file->store('service-forms/research', 'public');
                $fileAttachments['supportingLetter'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }

            if ($submission->service_type === 'transformation' && $request->hasFile('officialLetter')) {
                $file = $request->file('officialLetter');
                $path = $file->store('service-forms/transformation', 'public');
                $fileAttachments['officialLetter'] = [
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }

            if ($submission->service_type === 'licensing') {
                $fileAttachments['documents'] = $existingAttachments['documents'] ?? [];
                $documentIndex = 0;

                while ($request->hasFile("documents[{$documentIndex}]")) {
                    $file = $request->file("documents[{$documentIndex}]");
                    $path = $file->store('service-forms/licensing', 'public');
                    $fileAttachments['documents'][] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ];
                    $documentIndex++;
                }
            }

            if (!empty($fileAttachments)) {
                $formData['attachments'] = $fileAttachments;
            }

            $submission->update([
                'form_data' => $formData,
            ]);

            \Log::info('Service form updated', [
                'submission_id' => $submission->id,
                'reference_number' => $submission->reference_number,
                'updated_by' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Submission updated successfully',
                'data' => $submission->fresh()
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Service form update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating your request.',
            ], 500);
        }
    }

    /**
     * Track an external submission by reference number
     * Allows users to add submissions they created elsewhere to their dashboard
     */
    public function trackByReference(Request $request)
    {
        $validator = validator($request->all(), [
            'reference_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Reference number is required',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $referenceNumber = $request->input('reference_number');

        // Find the submission
        $submission = ServiceFormSubmission::where('reference_number', $referenceNumber)->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found with this reference number',
            ], 404);
        }

        // Check if already tracking
        $alreadyTracking = ServiceFormSubmission::where('reference_number', $referenceNumber)
            ->where(function($q) use ($user) {
                $q->where('submitted_by', $user->id)
                  ->orWhere('submitted_email', $user->email);
                if ($user->institution_id) {
                    $q->orWhere('institution_id', $user->institution_id);
                }
            })
            ->exists();

        if ($alreadyTracking) {
            return response()->json([
                'success' => false,
                'message' => 'You are already tracking this submission',
            ], 400);
        }

        // Link this user to the submission for tracking
        $submission->update([
            'submitted_by' => $submission->submitted_by ?? $user->id,
            'submitted_email' => $submission->submitted_email ?? $user->email,
            'institution_id' => $submission->institution_id ?? $user->institution_id,
        ]);

        \Log::info('User tracking external submission', [
            'user_id' => $user->id,
            'reference_number' => $referenceNumber,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Submission added to your tracking list',
            'data' => $submission
        ]);
    }

    /**
     * Download a file attachment from a service request
     */
    public function downloadFile(Request $request, $id)
    {
        $user = $request->user();
        $submission = ServiceFormSubmission::findOrFail($id);

        // Check access permissions
        $canAccess = false;

        // Submitter can download their own files
        if ($submission->submitted_by && $submission->submitted_by === $user->id) {
            $canAccess = true;
        }

        // Assigned reviewer can download
        if ($submission->reviewed_by && $submission->reviewed_by === $user->id) {
            $canAccess = true;
        }

        // Managers can download based on hierarchy
        $manageableRoles = \App\Services\RoleHierarchyService::getManageableRoles($user);
        if (!empty($manageableRoles)) {
            $canAccess = true;
        }

        if (!$canAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this file',
            ], 403);
        }

        // Get file path from query parameter
        $filePath = $request->query('path');
        
        if (!$filePath) {
            return response()->json([
                'success' => false,
                'message' => 'File path not specified',
            ], 400);
        }

        // Verify file exists in storage
        if (!\Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        // Get original filename from form_data attachments
        $originalName = basename($filePath);
        $mimeType = \Storage::disk('public')->mimeType($filePath);
        $attachments = $submission->form_data['attachments'] ?? [];
        
        // Find the original filename
        if (isset($attachments['supportingLetter']) && $attachments['supportingLetter']['path'] === $filePath) {
            $originalName = $attachments['supportingLetter']['original_name'];
        } elseif (isset($attachments['officialLetter']) && $attachments['officialLetter']['path'] === $filePath) {
            $originalName = $attachments['officialLetter']['original_name'];
        } elseif (isset($attachments['documents'])) {
            foreach ($attachments['documents'] as $doc) {
                if ($doc['path'] === $filePath) {
                    $originalName = $doc['original_name'];
                    break;
                }
            }
        }

        // Return file with inline content-disposition for viewing (not forcing download)
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $originalName . '"',
        ];

        return response()->file(\Storage::disk('public')->path($filePath), $headers);
    }

    /**
     * Delete a submission (only if pending)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $submission = ServiceFormSubmission::where('id', $id)
            ->where(function($q) use ($user) {
                $q->where('submitted_by', $user->id);
                if ($user->institution_id) {
                    $q->orWhere('institution_id', $user->institution_id);
                }
            })
            ->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found or access denied',
            ], 404);
        }

        // Only allow deletion for pending submissions
        if ($submission->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a submission that has already been reviewed',
            ], 403);
        }

        $referenceNumber = $submission->reference_number;
        $submission->delete();

        \Log::info('Service form deleted', [
            'reference_number' => $referenceNumber,
            'deleted_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Submission deleted successfully'
        ]);
    }

    /**
     * Get assignable users based on current user's hierarchy
     */
    public function getAssignableUsers(Request $request)
    {
        $currentUser = $request->user();
        
        // Get manageable roles from hierarchy service
        $manageableRoles = \App\Services\RoleHierarchyService::getManageableRoles($currentUser);
        
        if (empty($manageableRoles)) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No assignable users in your hierarchy'
            ]);
        }
        
        // Get users with manageable roles
        $users = \App\Models\User::whereHas('roles', function ($query) use ($manageableRoles) {
            $query->whereIn('name', $manageableRoles);
        })
        ->where('is_active', true)
        ->with('roles')
        ->orderBy('name')
        ->get();
        
        return response()->json([
            'success' => true,
            'data' => $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'department' => $user->department,
                'roles' => $user->roles->map(fn($role) => [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ]),
            ]),
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
        $validator = validator($formData, [
            'fullName' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'researchTitle' => 'required|string|max:255',
            'category' => 'required|string|in:System Request, Infrastructure Request, Security Related Request, Other',
            'abstract' => 'required|string|min:20|max:2000',
            'estimatedBudget' => 'nullable|string',
            'durationMonths' => 'required|integer|min:1|max:60',
            'agree' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Validate transformation form data
     */
    private function validateTransformationForm(array $formData)
    {
        $validator = validator($formData, [
            'agencyName' => 'required|string|max:255',
            'contactPerson' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'agencyType' => 'required|string|in:Bureau,Sub-city,Public Enterprise,Other',
            'currentMaturity' => 'required|string|in:Initial,Developing,Established,Advanced',
            'scope' => 'required|string|min:20',
            'expectedStart' => 'required|string',
            'agree' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Validate licensing form data
     */
    private function validateLicensingForm(array $formData)
    {
        $validator = validator($formData, [
            'applicantType' => 'required|string|in:Individual Professional,Firm,Vendor',
            'fullName' => 'required|string|max:255',
            'nationalId' => 'required|string|min:5',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'category' => 'required|string|in:Software Development,Networking & Infrastructure,Cybersecurity,Data & AI,IT Consulting,Hardware Supply',
            'grade' => 'required|string|in:Grade 1,Grade 2,Grade 3',
            'experienceYears' => 'required|integer|min:0|max:50',
            'organization' => 'nullable|string|max:255',
            'agree' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Validate LMS form data
     */
    private function validateLmsForm(array $formData)
    {
        $validator = validator($formData, [
            'learnerName' => 'required|string|max:255',
            'employeeId' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'agency' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'program' => 'required|string|in:Digital Leadership,Cybersecurity Awareness,Public Sector Data Analytics,AI for Government,Project Management',
            'cohort' => 'required|string|in:Self-paced,Q1 Cohort,Q2 Cohort,Q3 Cohort,Q4 Cohort',
            'notes' => 'nullable|string',
            'agree' => 'required|boolean|accepted',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
