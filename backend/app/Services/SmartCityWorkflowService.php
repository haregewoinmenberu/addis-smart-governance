<?php

namespace App\Services;

use App\Models\SmartCityRequest;
use App\Models\TechnologyRequest;
use App\Models\ResearchIdea;
use App\Models\ResearchProject;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

/**
 * Smart City Workflow Service
 * 
 * Manages the complete Smart City technology lifecycle:
 * 1. Request Entry (Internal/Institutional/External)
 * 2. Smart City Command Center Classification
 * 3. Research & Assessment OR Technology Transfer
 * 4. Development (Internal/External)
 * 5. Quality & Compliance Verification
 * 6. Final Operation by Smart City Command Center
 */
class SmartCityWorkflowService
{
    /**
     * Initialize workflow for a request received by Smart City Command Center
     */
    public function receiveRequest(array $requestData, ?int $userId = null): SmartCityRequest
    {
        return DB::transaction(function () use ($requestData, $userId) {
            // Determine source type
            $source = 'external'; // default
            if ($userId) {
                $user = \App\Models\User::find($userId);
                $source = $user->institution_id ? 'institutional' : 'internal';
            }

            $smartCityRequest = SmartCityRequest::create(array_merge($requestData, [
                'source' => $source,
                'submitted_by' => $userId,
                'status' => 'pending',
            ]));

            ActivityLog::log(
                'smart_city_request_received',
                'smart_city_requests',
                $smartCityRequest,
                $userId ? \App\Models\User::find($userId) : null
            );

            return $smartCityRequest;
        });
    }

    /**
     * Classify request as New System or Technology Transfer
     */
    public function classifyRequest(
        SmartCityRequest $request,
        string $classification,
        int $classifiedBy,
        ?string $notes = null
    ): SmartCityRequest {
        return DB::transaction(function () use ($request, $classification, $classifiedBy, $notes) {
            $request->classify($classification, $notes);

            ActivityLog::log(
                'request_classified_by_command_center',
                'smart_city_requests',
                $request,
                \App\Models\User::find($classifiedBy),
                [
                    'classification' => $classification,
                    'notes' => $notes,
                ]
            );

            return $request->fresh();
        });
    }

    /**
     * Route to Research & Assessment workflow
     */
    public function routeToResearch(
        SmartCityRequest $request,
        int $routedBy,
        ?array $additionalData = []
    ): ResearchIdea {
        return DB::transaction(function () use ($request, $routedBy, $additionalData) {
            $researchIdea = ResearchIdea::create([
                'title' => $request->title,
                'summary' => $request->description,
                'problem_statement' => $additionalData['problem_statement'] ?? $request->description,
                'objectives' => $additionalData['objectives'] ?? null,
                'expected_outcome' => $additionalData['expected_outcome'] ?? null,
                'research_category' => $additionalData['research_category'] ?? 'applied',
                'government_sector' => $additionalData['government_sector'] ?? null,
                'priority' => $request->priority,
                'status' => 'submitted',
                'submitted_by' => $request->submitted_by,
                'submitted_at' => now(),
                'assigned_to_smart_city' => $routedBy,
                'smart_city_assigned_at' => now(),
            ]);

            $request->routeTo($researchIdea);
            $request->markInProgress();

            ActivityLog::log(
                'request_routed_to_research',
                'smart_city_requests',
                $request,
                \App\Models\User::find($routedBy),
                ['research_idea_id' => $researchIdea->id]
            );

            return $researchIdea;
        });
    }

    /**
     * Route to Technology Transfer workflow
     */
    public function routeToTechnologyTransfer(
        SmartCityRequest $request,
        int $routedBy,
        ?array $additionalData = []
    ): TechnologyRequest {
        return DB::transaction(function () use ($request, $routedBy, $additionalData) {
            $techRequest = TechnologyRequest::create([
                'name' => $request->title,
                'description' => $request->description,
                'purpose' => $additionalData['purpose'] ?? null,
                'business_problem' => $additionalData['business_problem'] ?? null,
                'expected_benefits' => $additionalData['expected_benefits'] ?? null,
                'category' => $additionalData['category'] ?? null,
                'type' => $additionalData['type'] ?? null,
                'owner_organization_id' => $request->institution_id,
                'submitted_by' => $request->submitted_by,
                'is_external_request' => $request->isExternal(),
                'requester_name' => $request->external_requester_name,
                'requester_email' => $request->external_requester_email,
                'requester_phone' => $request->external_requester_phone,
                'requester_organization' => $request->external_requester_organization,
                'request_classification' => $request->classification,
                'assigned_to_command_center_at' => now(),
                'current_stage' => 'submission',
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            $request->routeTo($techRequest);
            $request->markInProgress();

            ActivityLog::log(
                'request_routed_to_technology_transfer',
                'smart_city_requests',
                $request,
                \App\Models\User::find($routedBy),
                ['technology_request_id' => $techRequest->id]
            );

            return $techRequest;
        });
    }

    /**
     * Complete workflow and return to Smart City Command Center for operations
     */
    public function completeAndReturnToOperations(
        SmartCityRequest $request,
        int $completedBy,
        ?string $outcomeNotes = null
    ): SmartCityRequest {
        return DB::transaction(function () use ($request, $completedBy, $outcomeNotes) {
            $request->complete();

            if ($outcomeNotes) {
                $metadata = $request->metadata ?? [];
                $metadata['completion_notes'] = $outcomeNotes;
                $request->update(['metadata' => $metadata]);
            }

            ActivityLog::log(
                'request_completed_returned_to_operations',
                'smart_city_requests',
                $request,
                \App\Models\User::find($completedBy),
                [
                    'outcome_notes' => $outcomeNotes,
                    'routed_entity' => $request->routed_to_type,
                ]
            );

            return $request->fresh();
        });
    }

    /**
     * Get request status summary
     */
    public function getRequestStatusSummary(SmartCityRequest $request): array
    {
        $summary = [
            'request_number' => $request->request_number,
            'title' => $request->title,
            'status' => $request->status,
            'classification' => $request->classification,
            'source' => $request->source,
            'submitted_at' => $request->submitted_at,
            'current_phase' => $this->getCurrentPhase($request),
        ];

        // Get routed workflow status if applicable
        if ($request->routed_to) {
            $routedEntity = $request->routedTo;
            
            if ($routedEntity instanceof TechnologyRequest) {
                $summary['workflow_type'] = 'Technology Transfer';
                $summary['workflow_stage'] = $routedEntity->current_stage?->label();
                $summary['workflow_status'] = $routedEntity->status;
            } else if ($routedEntity instanceof ResearchIdea) {
                $summary['workflow_type'] = 'Research & Assessment';
                $summary['workflow_status'] = $routedEntity->status?->label();
            } else if ($routedEntity instanceof ResearchProject) {
                $summary['workflow_type'] = 'Research Project';
                $summary['workflow_stage'] = $routedEntity->current_stage?->label();
            }
        }

        return $summary;
    }

    /**
     * Get current lifecycle phase
     */
    protected function getCurrentPhase(SmartCityRequest $request): string
    {
        return match($request->status) {
            'pending' => 'Awaiting Smart City Command Center Review',
            'under_review' => 'Under Review by Command Center',
            'classified' => 'Classified - Awaiting Routing',
            'routed' => 'Routed to ' . ($request->classification === 'new_system' ? 'Research & Development' : 'Technology Transfer'),
            'in_progress' => 'In Progress',
            'completed' => 'Completed - Operations Phase',
            'rejected' => 'Rejected',
            default => 'Unknown',
        };
    }

    /**
     * Check if technology already exists (duplication check)
     */
    public function checkForDuplication(string $technologyName, ?string $description = null): array
    {
        // This would integrate with DuplicationAnalysisService
        // Simplified version for now
        $similarTechnologies = TechnologyRequest::where('name', 'like', "%{$technologyName}%")
            ->orWhere('description', 'like', "%{$technologyName}%")
            ->limit(10)
            ->get();

        return [
            'has_duplicates' => $similarTechnologies->isNotEmpty(),
            'similar_count' => $similarTechnologies->count(),
            'similar_technologies' => $similarTechnologies,
        ];
    }

    /**
     * Get workflow statistics for Smart City Command Center dashboard
     */
    public function getWorkflowStatistics(): array
    {
        return [
            'total_requests' => SmartCityRequest::count(),
            'pending_classification' => SmartCityRequest::whereIn('status', ['pending', 'under_review'])->count(),
            'awaiting_routing' => SmartCityRequest::where('status', 'classified')->count(),
            'in_progress' => SmartCityRequest::where('status', 'in_progress')->count(),
            'completed' => SmartCityRequest::where('status', 'completed')->count(),
            'rejected' => SmartCityRequest::where('status', 'rejected')->count(),
            'by_classification' => [
                'new_system' => SmartCityRequest::where('classification', 'new_system')->count(),
                'technology_transfer' => SmartCityRequest::where('classification', 'technology_transfer')->count(),
                'pending' => SmartCityRequest::where('classification', 'pending')->count(),
            ],
            'by_source' => [
                'internal' => SmartCityRequest::internal()->count(),
                'institutional' => SmartCityRequest::institutional()->count(),
                'external' => SmartCityRequest::external()->count(),
            ],
            'research_in_progress' => ResearchIdea::whereIn('status', ['submitted', 'under_review', 'approved'])->count(),
            'technology_transfer_in_progress' => TechnologyRequest::whereIn('status', ['pending', 'under_evaluation', 'approved'])->count(),
        ];
    }
}
