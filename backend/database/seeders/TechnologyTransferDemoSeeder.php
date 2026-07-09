<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\TechnologyRequest;
use App\Models\TechnologyEvaluation;
use App\Models\CommitteeReview;
use App\Models\TechnologyRegistry;
use App\Models\DeploymentProject;
use App\Models\TechnologyMonitoring;
use App\Models\TechnologyIncident;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TechnologyTransferDemoSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Tech Manager',
                'email' => 'tech.manager@gov.et',
                'password' => Hash::make('password123'),
                'role' => 'technology_transfer_manager'
            ],
            [
                'name' => 'Security Officer',
                'email' => 'security@gov.et',
                'password' => Hash::make('password123'),
                'role' => 'security_officer'
            ],
            [
                'name' => 'Enterprise Architect',
                'email' => 'architect@gov.et',
                'password' => Hash::make('password123'),
                'role' => 'enterprise_architect'
            ],
            [
                'name' => 'Risk Officer',
                'email' => 'risk@gov.et',
                'password' => Hash::make('password123'),
                'role' => 'risk_officer'
            ],
            [
                'name' => 'Governance Committee',
                'email' => 'governance@gov.et',
                'password' => Hash::make('password123'),
                'role' => 'governance_committee'
            ],
            [
                'name' => 'Vendor User',
                'email' => 'vendor@tech.com',
                'password' => Hash::make('password123'),
                'role' => 'vendor'
            ],
        ];

        $createdUsers = [];
        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => $userData['password'],
                    'is_active' => true,
                ]
            );

            $role = Role::where('name', $userData['role'])->first();
            if ($role) {
                try {
                    $user->assignRole($role);
                } catch (\Exception $e) {
                    // Role assignment failed, continue
                }
            }

            $createdUsers[$userData['role']] = $user;
        }

        $techRequests = [
            [
                'name' => 'Cloud-Based Document Management System',
                'category' => 'software',
                'type' => 'platform',
                'description' => 'Enterprise document management system with version control, workflow automation, and digital signatures',
                'purpose' => 'Digitize government document processes and improve collaboration',
                'business_problem' => 'Manual document handling causing delays, lost documents, and lack of audit trail',
                'expected_benefits' => 'Reduce processing time by 70%, improve document security, enable remote work',
                'innovation_level' => 'high',
                'trl_level' => 7,
                'source_type' => 'vendor',
                'vendor_name' => 'TechSolutions Inc',
                'vendor_contact' => 'sales@techsolutions.com',
                'contact_person' => 'John Doe',
                'contact_email' => 'vendor@tech.com',
                'contact_phone' => '+251911234567',
                'estimated_cost' => 500000,
                'expected_users' => 500,
                'current_stage' => 'evaluation',
                'status' => 'submitted',
                'submitted_by' => $createdUsers['vendor']->id,
                'submitted_at' => now()->subDays(10),
            ],
            [
                'name' => 'AI-Powered Citizen Service Chatbot',
                'category' => 'ai_ml',
                'type' => 'service',
                'description' => 'Natural language chatbot for handling citizen inquiries 24/7',
                'purpose' => 'Improve citizen service accessibility and reduce call center load',
                'business_problem' => 'Citizens cannot get timely responses outside business hours',
                'expected_benefits' => 'Handle 80% of routine inquiries automatically, 24/7 availability',
                'innovation_level' => 'very_high',
                'trl_level' => 6,
                'source_type' => 'research',
                'contact_person' => 'Dr. Sarah Ahmed',
                'contact_email' => 'vendor@tech.com',
                'contact_phone' => '+251911234568',
                'estimated_cost' => 300000,
                'expected_users' => 10000,
                'current_stage' => 'submission',
                'status' => 'draft',
                'submitted_by' => $createdUsers['vendor']->id,
            ],
            [
                'name' => 'Blockchain Land Registry System',
                'category' => 'platform',
                'type' => 'infrastructure',
                'description' => 'Immutable blockchain-based land title registration and transfer system',
                'purpose' => 'Prevent land fraud and enable secure digital land transactions',
                'business_problem' => 'Land disputes due to fraudulent title modifications and lack of transparency',
                'expected_benefits' => 'Eliminate title fraud, reduce dispute resolution time by 90%',
                'innovation_level' => 'very_high',
                'trl_level' => 5,
                'source_type' => 'government',
                'contact_person' => 'Minister Office',
                'contact_email' => 'tech.manager@gov.et',
                'contact_phone' => '+251911234569',
                'estimated_cost' => 1200000,
                'expected_users' => 1000,
                'current_stage' => 'governance_decision',
                'status' => 'under_review',
                'submitted_by' => $createdUsers['technology_transfer_manager']->id,
                'submitted_at' => now()->subDays(30),
            ],
            [
                'name' => 'Mobile Payment Integration API',
                'category' => 'api',
                'type' => 'service',
                'description' => 'Unified API for integrating multiple mobile payment providers',
                'purpose' => 'Enable government services to accept mobile payments',
                'business_problem' => 'Citizens prefer mobile payments but government systems only accept cash',
                'expected_benefits' => 'Increase payment collection rate by 40%, reduce cash handling costs',
                'innovation_level' => 'medium',
                'trl_level' => 8,
                'source_type' => 'vendor',
                'vendor_name' => 'PayTech Solutions',
                'vendor_contact' => 'info@paytech.et',
                'contact_person' => 'Alice Kebede',
                'contact_email' => 'vendor@tech.com',
                'contact_phone' => '+251911234570',
                'estimated_cost' => 150000,
                'expected_users' => 50000,
                'current_stage' => 'licensing',
                'status' => 'approved',
                'submitted_by' => $createdUsers['vendor']->id,
                'submitted_at' => now()->subDays(60),
                'approved_at' => now()->subDays(20),
            ],
        ];

        $createdRequests = [];
        foreach ($techRequests as $requestData) {
            $request = TechnologyRequest::create($requestData);
            $createdRequests[] = $request;
        }

        foreach ($createdRequests as $index => $request) {
            if (in_array($request->current_stage->value, ['evaluation', 'governance_decision', 'licensing'])) {
                TechnologyEvaluation::create([
                    'technology_request_id' => $request->id,
                    'evaluation_type' => 'security_compliance',
                    'evaluator_id' => $createdUsers['security_officer']->id,
                    'status' => 'completed',
                    'score' => 85,
                    'risk_level' => 'low',
                    'findings' => 'Security controls are adequate. Encryption meets standards.',
                    'recommendations' => 'Implement regular security audits',
                    'assigned_at' => now()->subDays(8),
                    'completed_at' => now()->subDays(5),
                ]);

                TechnologyEvaluation::create([
                    'technology_request_id' => $request->id,
                    'evaluation_type' => 'architecture_review',
                    'evaluator_id' => $createdUsers['enterprise_architect']->id,
                    'status' => 'completed',
                    'score' => 90,
                    'risk_level' => 'low',
                    'findings' => 'Architecture follows enterprise standards. Scalable design.',
                    'recommendations' => 'Consider microservices for better modularity',
                    'assigned_at' => now()->subDays(8),
                    'completed_at' => now()->subDays(4),
                ]);

                TechnologyEvaluation::create([
                    'technology_request_id' => $request->id,
                    'evaluation_type' => 'risk_assessment',
                    'evaluator_id' => $createdUsers['risk_officer']->id,
                    'status' => 'completed',
                    'score' => 78,
                    'risk_level' => 'medium',
                    'findings' => 'Vendor lock-in risk identified. Data migration complexity.',
                    'recommendations' => 'Ensure data portability and exit strategy',
                    'assigned_at' => now()->subDays(8),
                    'completed_at' => now()->subDays(3),
                ]);
            }

            if (in_array($request->current_stage->value, ['governance_decision', 'licensing'])) {
                CommitteeReview::create([
                    'technology_request_id' => $request->id,
                    'decision' => 'approved',
                    'comments' => 'All evaluation scores are acceptable. Approved for licensing.',
                    'meeting_date' => now()->subDays(2),
                    'decision_date' => now()->subDays(1),
                    'created_by' => $createdUsers['governance_committee']->id,
                ]);
            }

            if ($request->current_stage->value === 'licensing') {
                $registry = TechnologyRegistry::create([
                    'technology_request_id' => $request->id,
                    'license_type' => 'enterprise',
                    'license_expiration' => now()->addYears(3),
                    'support_contact' => $request->contact_email,
                    'government_sector' => 'Digital Services',
                    'technology_status' => 'active',
                    'compliance_status' => 'compliant',
                    'registered_at' => now()->subDays(15),
                    'registered_by' => $createdUsers['technology_transfer_manager']->id,
                ]);

                DeploymentProject::create([
                    'technology_registry_id' => $registry->id,
                    'project_name' => "Deployment: {$request->name}",
                    'current_phase' => 'pilot',
                    'progress_percentage' => 45,
                    'start_date' => now()->subDays(10),
                    'end_date' => now()->addDays(80),
                    'project_manager_id' => $createdUsers['technology_transfer_manager']->id,
                    'status' => 'active',
                ]);

                TechnologyMonitoring::create([
                    'technology_registry_id' => $registry->id,
                    'monitoring_type' => 'security',
                    'status' => 'active',
                    'compliance_score' => 92,
                    'risk_score' => 15,
                    'performance_score' => 88,
                    'availability_percentage' => 99.5,
                    'usage_count' => 1250,
                    'support_tickets' => 3,
                    'last_check_date' => now()->subDays(1),
                    'next_check_date' => now()->addDays(29),
                ]);
            }
        }

        if (count($createdRequests) > 2) {
            $registry = TechnologyRegistry::where('technology_status', 'active')->first();
            if ($registry) {
                TechnologyIncident::create([
                    'technology_registry_id' => $registry->id,
                    'incident_type' => 'performance',
                    'severity' => 'medium',
                    'status' => 'investigating',
                    'title' => 'Slow Response Times During Peak Hours',
                    'description' => 'Users reporting 5-10 second delays during 9-11 AM peak hours',
                    'impact' => 'User productivity reduced during peak times',
                    'reported_by' => $createdUsers['technology_transfer_manager']->id,
                    'assigned_to' => $createdUsers['security_officer']->id,
                    'reported_at' => now()->subHours(6),
                    'acknowledged_at' => now()->subHours(5),
                ]);
            }
        }

        echo "Demo users created:\n";
        echo "1. tech.manager@gov.et / password123 (Technology Transfer Manager)\n";
        echo "2. security@gov.et / password123 (Security Officer)\n";
        echo "3. architect@gov.et / password123 (Enterprise Architect)\n";
        echo "4. risk@gov.et / password123 (Risk Officer)\n";
        echo "5. governance@gov.et / password123 (Governance Committee)\n";
        echo "6. vendor@tech.com / password123 (Vendor)\n";
    }
}
