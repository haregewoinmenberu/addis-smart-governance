<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SubCity;
use App\Models\RequestItem;
use App\Models\WorkflowDefinition;
use App\Models\WorkflowInstance;
use App\Services\WorkflowService;
use App\Services\DuplicationAnalysisService;
use App\Services\FeasibilityEvaluationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkflowSystemTest extends TestCase
{
    use RefreshDatabase;

    protected $itdbAdmin;
    protected $itdbAuditor;
    protected $subCityAdmin;
    protected $subCityAuditor;
    protected $subCity;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
        $this->artisan('db:seed', ['--class' => 'WorkflowDefinitionSeeder']);

        // Create sub-city
        $this->subCity = SubCity::create([
            'name' => 'Test Sub-City',
            'code' => 'TSC',
            'is_active' => true,
            'activated_at' => now(),
        ]);

        // Create users
        $this->itdbAdmin = User::factory()->create();
        $this->itdbAdmin->assignRole('itdb_administrator');

        $this->itdbAuditor = User::factory()->create();
        $this->itdbAuditor->assignRole('itdb_auditor');

        $this->subCityAdmin = User::factory()->create([
            'sub_city_id' => $this->subCity->id,
        ]);
        $this->subCityAdmin->assignRole('sub_city_admin');

        $this->subCityAuditor = User::factory()->create([
            'sub_city_id' => $this->subCity->id,
        ]);
        $this->subCityAuditor->assignRole('sub_city_auditor');
    }

    /** @test */
    public function sub_city_admin_can_create_request()
    {
        $response = $this->actingAs($this->subCityAdmin, 'api')
            ->postJson('/api/requests', [
                'title' => 'Test Request',
                'category' => 'Software',
                'office' => $this->subCity->name,
                'priority' => 'High',
                'budget' => 100000,
                'description' => 'Test description',
                'justification' => 'Test justification',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'code', 'title', 'status'],
            ]);

        $this->assertDatabaseHas('request_items', [
            'title' => 'Test Request',
            'submitted_by' => $this->subCityAdmin->id,
        ]);
    }

    /** @test */
    public function sub_city_admin_can_submit_request()
    {
        $request = RequestItem::create([
            'code' => 'TR-2026-0001',
            'title' => 'Test Request',
            'category' => 'Software',
            'office' => $this->subCity->name,
            'status' => 'Draft',
            'approval_status' => 'draft',
            'step' => 0,
            'total_steps' => 5,
            'budget' => 100000,
            'submitted_at' => now(),
            'priority' => 'High',
            'description' => 'Test',
            'justification' => 'Test',
            'submitted_by' => $this->subCityAdmin->id,
        ]);

        $response = $this->actingAs($this->subCityAdmin, 'api')
            ->postJson("/api/requests/{$request->id}/submit");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Request submitted successfully']);

        $this->assertDatabaseHas('request_items', [
            'id' => $request->id,
            'status' => 'Submitted',
            'approval_status' => 'pending',
        ]);

        $this->assertDatabaseHas('workflow_instances', [
            'workflowable_type' => RequestItem::class,
            'workflowable_id' => $request->id,
            'status' => 'in_progress',
        ]);
    }

    /** @test */
    public function itdb_admin_can_approve_workflow_stage()
    {
        $request = $this->createRequestWithWorkflow();

        $response = $this->actingAs($this->itdbAdmin, 'api')
            ->postJson("/api/workflows/instances/{$request->workflowInstance->id}/approve", [
                'comments' => 'Approved',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Workflow stage approved successfully']);
    }

    /** @test */
    public function itdb_auditor_can_perform_duplication_analysis()
    {
        $request = $this->createRequestWithWorkflow();

        $response = $this->actingAs($this->itdbAuditor, 'api')
            ->postJson("/api/duplications/requests/{$request->id}/analyze");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'similarity_score', 'recommendation'],
            ]);

        $this->assertDatabaseHas('duplication_cases', [
            'request_item_id' => $request->id,
        ]);
    }

    /** @test */
    public function itdb_auditor_can_conduct_feasibility_study()
    {
        $request = $this->createRequestWithWorkflow();

        $response = $this->actingAs($this->itdbAuditor, 'api')
            ->postJson("/api/feasibility-studies/requests/{$request->id}/evaluate", [
                'technical_score' => 85,
                'financial_score' => 80,
                'security_score' => 90,
                'infrastructure_score' => 75,
                'integration_score' => 80,
                'sustainability_score' => 85,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'overall_risk_score', 'recommendation'],
            ]);

        $this->assertDatabaseHas('feasibility_studies', [
            'request_item_id' => $request->id,
        ]);
    }

    /** @test */
    public function sub_city_admin_cannot_approve_workflow()
    {
        $request = $this->createRequestWithWorkflow();

        $response = $this->actingAs($this->subCityAdmin, 'api')
            ->postJson("/api/workflows/instances/{$request->workflowInstance->id}/approve", [
                'comments' => 'Trying to approve',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'You do not have permission to approve this stage']);
    }

    /** @test */
    public function sub_city_admin_can_only_view_own_subcity_requests()
    {
        // Create request for this sub-city
        $ownRequest = RequestItem::create([
            'code' => 'TR-2026-0001',
            'title' => 'Own Request',
            'category' => 'Software',
            'office' => $this->subCity->name,
            'status' => 'Draft',
            'approval_status' => 'draft',
            'step' => 0,
            'total_steps' => 5,
            'budget' => 100000,
            'submitted_at' => now(),
            'priority' => 'High',
            'description' => 'Test',
            'justification' => 'Test',
            'submitted_by' => $this->subCityAdmin->id,
        ]);

        // Create another sub-city and request
        $otherSubCity = SubCity::create([
            'name' => 'Other Sub-City',
            'code' => 'OSC',
            'is_active' => true,
        ]);

        $otherAdmin = User::factory()->create(['sub_city_id' => $otherSubCity->id]);
        $otherAdmin->assignRole('sub_city_admin');

        $otherRequest = RequestItem::create([
            'code' => 'TR-2026-0002',
            'title' => 'Other Request',
            'category' => 'Software',
            'office' => $otherSubCity->name,
            'status' => 'Draft',
            'approval_status' => 'draft',
            'step' => 0,
            'total_steps' => 5,
            'budget' => 100000,
            'submitted_at' => now(),
            'priority' => 'High',
            'description' => 'Test',
            'justification' => 'Test',
            'submitted_by' => $otherAdmin->id,
        ]);

        $response = $this->actingAs($this->subCityAdmin, 'api')
            ->getJson('/api/requests');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($ownRequest->id, $data[0]['id']);
    }

    /** @test */
    public function itdb_admin_can_view_all_requests()
    {
        // Create requests from different sub-cities
        RequestItem::create([
            'code' => 'TR-2026-0001',
            'title' => 'Request 1',
            'category' => 'Software',
            'office' => $this->subCity->name,
            'status' => 'Draft',
            'approval_status' => 'draft',
            'step' => 0,
            'total_steps' => 5,
            'budget' => 100000,
            'submitted_at' => now(),
            'priority' => 'High',
            'description' => 'Test',
            'justification' => 'Test',
            'submitted_by' => $this->subCityAdmin->id,
        ]);

        $otherSubCity = SubCity::create([
            'name' => 'Other Sub-City',
            'code' => 'OSC',
            'is_active' => true,
        ]);

        $otherAdmin = User::factory()->create(['sub_city_id' => $otherSubCity->id]);
        $otherAdmin->assignRole('sub_city_admin');

        RequestItem::create([
            'code' => 'TR-2026-0002',
            'title' => 'Request 2',
            'category' => 'Software',
            'office' => $otherSubCity->name,
            'status' => 'Draft',
            'approval_status' => 'draft',
            'step' => 0,
            'total_steps' => 5,
            'budget' => 100000,
            'submitted_at' => now(),
            'priority' => 'High',
            'description' => 'Test',
            'justification' => 'Test',
            'submitted_by' => $otherAdmin->id,
        ]);

        $response = $this->actingAs($this->itdbAdmin, 'api')
            ->getJson('/api/requests');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    /** @test */
    public function workflow_can_be_rejected()
    {
        $request = $this->createRequestWithWorkflow();

        $response = $this->actingAs($this->itdbAdmin, 'api')
            ->postJson("/api/workflows/instances/{$request->workflowInstance->id}/reject", [
                'comments' => 'Budget not justified',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Workflow rejected']);

        $this->assertDatabaseHas('workflow_instances', [
            'id' => $request->workflowInstance->id,
            'status' => 'rejected',
        ]);

        $this->assertDatabaseHas('request_items', [
            'id' => $request->id,
            'status' => 'Rejected',
        ]);
    }

    /** @test */
    public function workflow_can_request_revision()
    {
        $request = $this->createRequestWithWorkflow();

        $response = $this->actingAs($this->itdbAdmin, 'api')
            ->postJson("/api/workflows/instances/{$request->workflowInstance->id}/request-revision", [
                'comments' => 'Need more details',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Revision requested']);

        $this->assertDatabaseHas('workflow_instances', [
            'id' => $request->workflowInstance->id,
            'status' => 'revision_requested',
        ]);

        $this->assertDatabaseHas('request_items', [
            'id' => $request->id,
            'status' => 'Revision Required',
        ]);
    }

    /** @test */
    public function only_itdb_admin_can_cancel_workflow()
    {
        $request = $this->createRequestWithWorkflow();

        // Try with ITDB Auditor (should fail)
        $response = $this->actingAs($this->itdbAuditor, 'api')
            ->postJson("/api/workflows/instances/{$request->workflowInstance->id}/cancel", [
                'reason' => 'Cancelled',
            ]);

        $response->assertStatus(403);

        // Try with ITDB Admin (should succeed)
        $response = $this->actingAs($this->itdbAdmin, 'api')
            ->postJson("/api/workflows/instances/{$request->workflowInstance->id}/cancel", [
                'reason' => 'Cancelled by admin',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Workflow cancelled']);
    }

    protected function createRequestWithWorkflow()
    {
        $request = RequestItem::create([
            'code' => 'TR-2026-TEST',
            'title' => 'Test Request',
            'category' => 'Software',
            'office' => $this->subCity->name,
            'status' => 'Draft',
            'approval_status' => 'draft',
            'step' => 0,
            'total_steps' => 5,
            'budget' => 100000,
            'submitted_at' => now(),
            'priority' => 'High',
            'description' => 'Test',
            'justification' => 'Test',
            'submitted_by' => $this->subCityAdmin->id,
        ]);

        $workflowService = app(WorkflowService::class);
        $instance = $workflowService->initializeWorkflow('tech_request_approval', $request);

        $request->update([
            'workflow_instance_id' => $instance->id,
            'status' => 'Submitted',
            'approval_status' => 'pending',
        ]);

        return $request->fresh('workflowInstance');
    }
}
