<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmartCityRequest;
use App\Models\TechnologyRequest;
use App\Models\ResearchIdea;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SmartCityRequestController extends Controller
{
    /**
     * Get all requests for Smart City Command Center
     */
    public function index(Request $request)
    {
        $query = SmartCityRequest::with(['submitter', 'institution', 'commandCenterAssignee']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by classification
        if ($request->has('classification')) {
            $query->where('classification', $request->classification);
        }

        // Filter by source
        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        // Filter for command center (pending, under_review, classified)
        if ($request->boolean('for_command_center')) {
            $query->forCommandCenter();
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($requests);
    }

    /**
     * Create internal request (authenticated users)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'request_type' => 'required|in:new_system,technology_transfer,improvement,research',
            'priority' => 'nullable|in:low,medium,high,critical',
            'attachments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();

        $smartCityRequest = SmartCityRequest::create([
            'title' => $request->title,
            'description' => $request->description,
            'request_type' => $request->request_type,
            'source' => $user->institution_id ? 'institutional' : 'internal',
            'submitted_by' => $user->id,
            'institution_id' => $user->institution_id,
            'priority' => $request->get('priority', 'medium'),
            'attachments' => $request->get('attachments', []),
            'metadata' => $request->get('metadata', []),
            'status' => 'pending',
        ]);

        ActivityLog::log('smart_city_request_created', 'smart_city_requests', $smartCityRequest, $user);

        return response()->json([
            'message' => 'Request submitted successfully. Reference number: ' . $smartCityRequest->request_number,
            'request' => $smartCityRequest->load(['submitter', 'institution']),
        ], 201);
    }

    /**
     * Create external request (non-authenticated public users)
     */
    public function storeExternal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'request_type' => 'required|in:new_system,technology_transfer,improvement,research',
            'requester_name' => 'required|string|max:255',
            'requester_email' => 'required|email|max:255',
            'requester_phone' => 'nullable|string|max:50',
            'requester_organization' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high,critical',
            'attachments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::create([
            'title' => $request->title,
            'description' => $request->description,
            'request_type' => $request->request_type,
            'source' => 'external',
            'external_requester_name' => $request->requester_name,
            'external_requester_email' => $request->requester_email,
            'external_requester_phone' => $request->requester_phone,
            'external_requester_organization' => $request->requester_organization,
            'priority' => $request->get('priority', 'medium'),
            'attachments' => $request->get('attachments', []),
            'metadata' => $request->get('metadata', []),
            'status' => 'pending',
        ]);

        ActivityLog::log('external_request_created', 'smart_city_requests', $smartCityRequest);

        return response()->json([
            'message' => 'Request submitted successfully. Please save your reference number: ' . $smartCityRequest->request_number,
            'request_number' => $smartCityRequest->request_number,
            'request' => $smartCityRequest,
        ], 201);
    }

    /**
     * Track request by reference number (public endpoint)
     */
    public function trackByReference(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'request_number' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::where('request_number', $request->request_number)
            ->where(function ($q) use ($request) {
                $q->where('external_requester_email', $request->email)
                    ->orWhereHas('submitter', function ($subQ) use ($request) {
                        $subQ->where('email', $request->email);
                    });
            })
            ->first();

        if (!$smartCityRequest) {
            return response()->json(['message' => 'Request not found or email does not match'], 404);
        }

        return response()->json([
            'request' => $smartCityRequest->only([
                'request_number', 'title', 'description', 'request_type', 
                'status', 'classification', 'priority', 'submitted_at', 'completed_at'
            ]),
            'timeline' => $smartCityRequest->activityLogs()->orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Show single request
     */
    public function show($id)
    {
        $smartCityRequest = SmartCityRequest::with([
            'submitter', 
            'institution', 
            'commandCenterAssignee',
            'routedTo',
            'activityLogs.user'
        ])->findOrFail($id);

        return response()->json($smartCityRequest);
    }

    /**
     * Assign request to Smart City Command Center member
     */
    public function assign(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'assigned_to' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::findOrFail($id);
        $user = auth()->user();

        $smartCityRequest->assignToCommandCenter(\App\Models\User::find($request->assigned_to));

        ActivityLog::log('request_assigned_to_command_center', 'smart_city_requests', $smartCityRequest, $user, [
            'assigned_to' => $request->assigned_to,
        ]);

        return response()->json([
            'message' => 'Request assigned successfully',
            'request' => $smartCityRequest->fresh(['commandCenterAssignee']),
        ]);
    }

    /**
     * Classify request (Smart City Command Center decision)
     */
    public function classify(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'classification' => 'required|in:new_system,technology_transfer',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::findOrFail($id);
        $user = auth()->user();

        $smartCityRequest->classify($request->classification, $request->notes);

        ActivityLog::log('request_classified', 'smart_city_requests', $smartCityRequest, $user, [
            'classification' => $request->classification,
        ]);

        return response()->json([
            'message' => 'Request classified successfully',
            'request' => $smartCityRequest->fresh(),
        ]);
    }

    /**
     * Route request to appropriate workflow
     */
    public function route(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'workflow_type' => 'required|in:research,technology_transfer,development',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::findOrFail($id);
        $user = auth()->user();

        try {
            DB::beginTransaction();

            // Create appropriate workflow entity based on classification
            if ($request->workflow_type === 'research') {
                // Create Research Idea
                $researchIdea = ResearchIdea::create([
                    'title' => $smartCityRequest->title,
                    'summary' => $smartCityRequest->description,
                    'problem_statement' => $smartCityRequest->description,
                    'objectives' => $smartCityRequest->metadata['objectives'] ?? null,
                    'expected_outcome' => $smartCityRequest->metadata['expected_outcome'] ?? null,
                    'research_category' => $smartCityRequest->metadata['research_category'] ?? 'applied',
                    'priority' => $smartCityRequest->priority,
                    'status' => 'submitted',
                    'submitted_by' => $smartCityRequest->submitted_by,
                    'submitted_at' => now(),
                ]);

                $smartCityRequest->routeTo($researchIdea);
                
            } else if ($request->workflow_type === 'technology_transfer') {
                // Create Technology Request
                $techRequest = TechnologyRequest::create([
                    'name' => $smartCityRequest->title,
                    'description' => $smartCityRequest->description,
                    'purpose' => $smartCityRequest->metadata['purpose'] ?? null,
                    'business_problem' => $smartCityRequest->metadata['business_problem'] ?? null,
                    'expected_benefits' => $smartCityRequest->metadata['expected_benefits'] ?? null,
                    'owner_organization_id' => $smartCityRequest->institution_id,
                    'submitted_by' => $smartCityRequest->submitted_by,
                    'is_external_request' => $smartCityRequest->isExternal(),
                    'requester_name' => $smartCityRequest->external_requester_name,
                    'requester_email' => $smartCityRequest->external_requester_email,
                    'requester_phone' => $smartCityRequest->external_requester_phone,
                    'requester_organization' => $smartCityRequest->external_requester_organization,
                    'request_classification' => $smartCityRequest->classification,
                    'current_stage' => 'submission',
                    'status' => 'pending',
                    'submitted_at' => now(),
                ]);

                $smartCityRequest->routeTo($techRequest);
            }

            if ($request->has('notes')) {
                $smartCityRequest->update(['command_center_notes' => $request->notes]);
            }

            ActivityLog::log('request_routed', 'smart_city_requests', $smartCityRequest, $user, [
                'workflow_type' => $request->workflow_type,
                'routed_to_type' => $smartCityRequest->routed_to_type,
                'routed_to_id' => $smartCityRequest->routed_to_id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Request routed successfully',
                'request' => $smartCityRequest->fresh(['routedTo']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to route request: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject request
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::findOrFail($id);
        $user = auth()->user();

        $smartCityRequest->reject($request->reason);

        ActivityLog::log('request_rejected', 'smart_city_requests', $smartCityRequest, $user, [
            'reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Request rejected',
            'request' => $smartCityRequest->fresh(),
        ]);
    }

    /**
     * Update request status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,under_review,classified,routed,in_progress,completed,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $smartCityRequest = SmartCityRequest::findOrFail($id);
        $user = auth()->user();

        $oldStatus = $smartCityRequest->status;
        $smartCityRequest->update(['status' => $request->status]);

        ActivityLog::log('request_status_updated', 'smart_city_requests', $smartCityRequest, $user, [
            'old_status' => $oldStatus,
            'new_status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Request status updated',
            'request' => $smartCityRequest->fresh(),
        ]);
    }

    /**
     * Get dashboard statistics for Command Center
     */
    public function statistics()
    {
        $stats = [
            'total_requests' => SmartCityRequest::count(),
            'pending_requests' => SmartCityRequest::where('status', 'pending')->count(),
            'under_review' => SmartCityRequest::where('status', 'under_review')->count(),
            'classified' => SmartCityRequest::where('status', 'classified')->count(),
            'routed' => SmartCityRequest::where('status', 'routed')->count(),
            'in_progress' => SmartCityRequest::where('status', 'in_progress')->count(),
            'completed' => SmartCityRequest::where('status', 'completed')->count(),
            'rejected' => SmartCityRequest::where('status', 'rejected')->count(),
            'by_classification' => [
                'new_system' => SmartCityRequest::where('classification', 'new_system')->count(),
                'technology_transfer' => SmartCityRequest::where('classification', 'technology_transfer')->count(),
                'pending' => SmartCityRequest::where('classification', 'pending')->count(),
            ],
            'by_source' => [
                'internal' => SmartCityRequest::where('source', 'internal')->count(),
                'institutional' => SmartCityRequest::where('source', 'institutional')->count(),
                'external' => SmartCityRequest::where('source', 'external')->count(),
            ],
            'by_priority' => [
                'critical' => SmartCityRequest::where('priority', 'critical')->count(),
                'high' => SmartCityRequest::where('priority', 'high')->count(),
                'medium' => SmartCityRequest::where('priority', 'medium')->count(),
                'low' => SmartCityRequest::where('priority', 'low')->count(),
            ],
        ];

        return response()->json($stats);
    }
}
