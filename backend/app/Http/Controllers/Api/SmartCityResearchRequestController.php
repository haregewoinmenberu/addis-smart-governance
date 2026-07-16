<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmartCityResearchRequest;
use App\Models\ResearchCommunication;
use App\Models\User;
use Illuminate\Http\Request;

class SmartCityResearchRequestController extends Controller
{
    /**
     * List all Smart City research requests
     * Accessible by: Smart City Command Center, Research Director
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = SmartCityResearchRequest::with([
            'requestedBy',
            'assignedTo',
            'researchProject.projectLead'
        ]);

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by sector
        if ($request->sector) {
            $query->where('requesting_sector', $request->sector);
        }

        // Role-based filtering
        if ($user->hasRole('research_director')) {
            // Research Director sees assigned requests
            $query->where('assigned_to', $user->id)
                ->orWhere('status', 'pending');
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * Smart City Command Center creates research request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'problem_context' => 'required|string',
            'requesting_sector' => 'required|string',
            'priority' => 'nullable|string',
            'expected_delivery_date' => 'nullable|date',
        ]);

        $validated['requested_by'] = auth()->id();
        $validated['requested_date'] = now();
        $validated['status'] = 'pending';

        $researchRequest = SmartCityResearchRequest::create($validated);

        // Notify Research Director
        $director = User::role('research_director')->first();
        if ($director) {
            ResearchCommunication::create([
                'research_project_id' => null,
                'communication_type' => 'request',
                'from_user_id' => auth()->id(),
                'to_user_id' => $director->id,
                'from_role' => 'smart_city_command',
                'to_role' => 'research_director',
                'subject' => "New Research Request: {$researchRequest->title}",
                'message' => "A new research request has been submitted from {$validated['requesting_sector']} sector.",
            ]);
        }

        return response()->json($researchRequest->load('requestedBy'), 201);
    }

    /**
     * Show single research request
     */
    public function show(SmartCityResearchRequest $smartCityResearchRequest)
    {
        return response()->json($smartCityResearchRequest->load([
            'requestedBy',
            'assignedTo',
            'researchProject.projectLead',
            'researchProject.teamMembers.user',
            'communications.fromUser',
            'communications.toUser'
        ]));
    }

    /**
     * Update research request
     */
    public function update(Request $request, SmartCityResearchRequest $smartCityResearchRequest)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'problem_context' => 'sometimes|string',
            'requesting_sector' => 'sometimes|string',
            'priority' => 'nullable|string',
            'expected_delivery_date' => 'nullable|date',
        ]);

        $smartCityResearchRequest->update($validated);

        return response()->json($smartCityResearchRequest);
    }

    /**
     * Research Director assigns request to themselves
     */
    public function assign(Request $request, SmartCityResearchRequest $smartCityResearchRequest)
    {
        $user = $request->user();

        if (!$user->hasRole('research_director')) {
            return response()->json(['message' => 'Only Research Director can assign requests'], 403);
        }

        $smartCityResearchRequest->assignToDirector($user);

        // Send communication back to Smart City
        ResearchCommunication::create([
            'research_project_id' => null,
            'communication_type' => 'update',
            'from_user_id' => $user->id,
            'to_user_id' => $smartCityResearchRequest->requested_by,
            'from_role' => 'research_director',
            'to_role' => 'smart_city_command',
            'subject' => "Request Assigned: {$smartCityResearchRequest->title}",
            'message' => "Your research request has been assigned and is being processed.",
        ]);

        return response()->json([
            'message' => 'Request assigned successfully',
            'request' => $smartCityResearchRequest->fresh()
        ]);
    }

    /**
     * Complete research and deliver to Smart City
     */
    public function complete(Request $request, SmartCityResearchRequest $smartCityResearchRequest)
    {
        $validated = $request->validate([
            'outcome_summary' => 'required|string',
        ]);

        $smartCityResearchRequest->complete($validated['outcome_summary']);

        // Notify Smart City Command Center
        ResearchCommunication::create([
            'research_project_id' => $smartCityResearchRequest->research_project_id,
            'communication_type' => 'report',
            'from_user_id' => auth()->id(),
            'to_user_id' => $smartCityResearchRequest->requested_by,
            'from_role' => 'research_director',
            'to_role' => 'smart_city_command',
            'subject' => "Research Completed: {$smartCityResearchRequest->title}",
            'message' => $validated['outcome_summary'],
        ]);

        return response()->json([
            'message' => 'Research completed and delivered to Smart City Command Center',
            'request' => $smartCityResearchRequest->fresh()
        ]);
    }

    /**
     * Get communications for a request
     */
    public function communications(SmartCityResearchRequest $smartCityResearchRequest)
    {
        $communications = ResearchCommunication::where('research_project_id', $smartCityResearchRequest->research_project_id)
            ->with(['fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($communications);
    }

    /**
     * Send communication message
     */
    public function sendCommunication(Request $request, SmartCityResearchRequest $smartCityResearchRequest)
    {
        $validated = $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'to_role' => 'required|string',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'communication_type' => 'required|string|in:request,update,approval,feedback,report',
        ]);

        $user = $request->user();
        $fromRole = $user->roles->first()->name ?? 'unknown';

        $communication = ResearchCommunication::create([
            'research_project_id' => $smartCityResearchRequest->research_project_id,
            'communication_type' => $validated['communication_type'],
            'from_user_id' => $user->id,
            'to_user_id' => $validated['to_user_id'],
            'from_role' => $fromRole,
            'to_role' => $validated['to_role'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        return response()->json($communication->load(['fromUser', 'toUser']), 201);
    }
}
