<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\ResearchIdea;
use App\Models\ResearchIdeaAttachment;
use App\Models\ResearchProject;
use App\Models\ResearchScreening;
use App\Enums\IdeaStatus;
use App\Enums\Priority;
use App\Enums\ResearchCategory;
use App\Enums\ResearchStage;
use App\Enums\ApprovalDecision;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ResearchDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure all research roles have dashboard permissions
        $this->ensureDashboardPermissions();

        // Create Demo Users
        $director = User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'director@research.gov',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $directorRole = Role::where('name', 'research_director')->first();
        if ($directorRole) $director->roles()->attach($directorRole->id);

        $lead = User::create([
            'name' => 'Prof. Michael Chen',
            'email' => 'lead@research.gov',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $leadRole = Role::where('name', 'research_lead')->first();
        if ($leadRole) $lead->roles()->attach($leadRole->id);

        $committee = User::create([
            'name' => 'Dr. Emily Brown',
            'email' => 'committee@research.gov',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $committeeRole = Role::where('name', 'review_committee')->first();
        if ($committeeRole) $committee->roles()->attach($committeeRole->id);

        $researcher = User::create([
            'name' => 'David Martinez',
            'email' => 'researcher@research.gov',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $researcherRole = Role::where('name', 'researcher')->first();
        if ($researcherRole) $researcher->roles()->attach($researcherRole->id);

        // Create Research Ideas
        $idea1 = ResearchIdea::create([
            'title' => 'AI-Powered Smart Traffic Management System',
            'summary' => 'Develop an intelligent traffic management system using machine learning to optimize traffic flow and reduce congestion in urban areas.',
            'problem_statement' => 'Current traffic management systems in Addis Ababa are reactive rather than proactive, leading to significant congestion during peak hours. Manual traffic control is inefficient and cannot adapt to real-time conditions.',
            'objectives' => 'Design and implement an AI-based system that predicts traffic patterns, optimizes signal timing, and provides real-time routing suggestions to reduce congestion by 30%.',
            'expected_outcome' => 'A fully functional smart traffic management system deployed in 3 pilot intersections, demonstrating measurable improvements in traffic flow and reduced wait times.',
            'research_category' => ResearchCategory::APPLIED_RESEARCH->value,
            'government_sector' => 'Transportation',
            'priority' => Priority::HIGH->value,
            'status' => IdeaStatus::SUBMITTED->value,
            'submitted_by' => $researcher->id,
            'submitted_at' => now()->subDays(5),
        ]);

        $idea2 = ResearchIdea::create([
            'title' => 'Blockchain-Based Land Registry System',
            'summary' => 'Create a secure, transparent land registration system using blockchain technology to prevent fraud and streamline property transactions.',
            'problem_statement' => 'The current land registry system is paper-based, prone to fraud, and lacks transparency. Property disputes are common due to unclear ownership records.',
            'objectives' => 'Develop a decentralized blockchain platform for land registration that ensures immutability, transparency, and easy verification of land ownership.',
            'expected_outcome' => 'A pilot blockchain system managing 1000+ land records with zero fraud incidents and 50% reduction in transaction processing time.',
            'research_category' => ResearchCategory::INNOVATION->value,
            'government_sector' => 'Land Administration',
            'priority' => Priority::CRITICAL->value,
            'status' => IdeaStatus::APPROVED->value,
            'submitted_by' => $lead->id,
            'submitted_at' => now()->subDays(10),
        ]);

        $idea3 = ResearchIdea::create([
            'title' => 'Solar-Powered Water Purification for Rural Communities',
            'summary' => 'Design affordable solar-powered water purification units for rural areas lacking access to clean drinking water.',
            'problem_statement' => 'Over 40% of rural communities lack access to safe drinking water, leading to waterborne diseases and health issues.',
            'objectives' => 'Create a low-cost, solar-powered water purification system that can serve communities of 500-1000 people with minimal maintenance.',
            'expected_outcome' => 'Prototype units installed in 5 rural communities, providing clean water to 5000+ people and reducing waterborne diseases by 60%.',
            'research_category' => ResearchCategory::EXPERIMENTAL_DEVELOPMENT->value,
            'government_sector' => 'Health & Water',
            'priority' => Priority::HIGH->value,
            'status' => IdeaStatus::UNDER_REVIEW->value,
            'submitted_by' => $researcher->id,
            'submitted_at' => now()->subDays(3),
        ]);

        $idea4 = ResearchIdea::create([
            'title' => 'E-Learning Platform for Remote Education',
            'summary' => 'Build a comprehensive e-learning platform with offline capabilities for students in areas with limited internet connectivity.',
            'problem_statement' => 'Remote and rural students have limited access to quality education materials, especially during emergencies like pandemics.',
            'objectives' => 'Develop an offline-first e-learning platform with video lessons, interactive quizzes, and progress tracking that works with minimal bandwidth.',
            'expected_outcome' => 'Platform deployed in 20 schools, serving 10,000+ students with 90% student satisfaction and improved test scores.',
            'research_category' => ResearchCategory::PILOT_PROJECT->value,
            'government_sector' => 'Education',
            'priority' => Priority::MEDIUM->value,
            'status' => IdeaStatus::DRAFT->value,
            'submitted_by' => $lead->id,
            'submitted_at' => null,
        ]);

        // Create sample attachments for testing document preview
        $this->createSampleAttachments($idea1, $researcher->id);
        $this->createSampleAttachments($idea2, $lead->id);
        $this->createSampleAttachments($idea3, $researcher->id);

        // Create Screening for idea2
        ResearchScreening::create([
            'research_idea_id' => $idea2->id,
            'evaluated_by' => $committee->id,
            'strategic_alignment_score' => 10,
            'strategic_alignment_comment' => 'Perfectly aligned with national digital transformation strategy',
            'feasibility_score' => 8,
            'feasibility_comment' => 'Technology exists, implementation requires technical expertise',
            'governance_impact_score' => 10,
            'governance_impact_comment' => 'Will significantly improve land administration transparency',
            'resource_requirement_score' => 7,
            'resource_requirement_comment' => 'Moderate budget needed for blockchain infrastructure',
            'innovation_level_score' => 9,
            'innovation_level_comment' => 'Novel application of blockchain in Ethiopian context',
            'risk_level_score' => 6,
            'risk_level_comment' => 'Technical risks manageable, stakeholder adoption is key',
            'decision' => ApprovalDecision::APPROVED->value,
            'overall_comment' => 'Excellent proposal with high impact potential. Recommend immediate project initiation.',
        ]);

        // Create Research Project from approved idea
        $project1 = ResearchProject::create([
            'research_idea_id' => $idea2->id,
            'title' => $idea2->title,
            'current_stage' => ResearchStage::PROPOSAL_DEVELOPMENT->value,
            'background' => 'Land disputes cost the government millions annually. Blockchain technology offers immutable records and transparency.',
            'objectives' => 'Develop and pilot a blockchain-based land registry in one sub-city, targeting 1000 properties.',
            'methodology' => 'Agile development with 3-month sprints. Tech stack: Hyperledger Fabric, React frontend, RESTful APIs.',
            'expected_deliverables' => 'Working blockchain platform, mobile app, admin dashboard, training materials, pilot results report.',
            'estimated_budget' => 2500000.00,
            'required_resources' => '5 blockchain developers, 2 UX designers, 1 project manager, cloud infrastructure, training budget.',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addMonths(12),
            'risk_analysis' => 'Main risks: stakeholder resistance, technical complexity, integration with legacy systems.',
            'success_metrics' => 'Zero fraud cases, 50% faster transactions, 80% user satisfaction, successful registration of 1000 properties.',
            'progress_percentage' => 15,
            'project_lead_id' => $lead->id,
            'trl_level' => 3,
        ]);

        $project2 = ResearchProject::create([
            'research_idea_id' => $idea1->id,
            'title' => $idea1->title,
            'current_stage' => ResearchStage::EXECUTION->value,
            'background' => 'Traffic congestion costs Addis Ababa economy $500M annually in lost productivity.',
            'objectives' => 'Deploy AI traffic system at 3 intersections to reduce congestion by 30%.',
            'methodology' => 'Computer vision for vehicle detection, ML for pattern prediction, cloud-based control system.',
            'expected_deliverables' => 'AI models, edge computing units, traffic cameras, control dashboard, impact assessment report.',
            'estimated_budget' => 1800000.00,
            'required_resources' => '3 ML engineers, 2 hardware engineers, traffic cameras, GPU servers, 6-month operational budget.',
            'start_date' => now()->subMonths(2),
            'end_date' => now()->addMonths(10),
            'risk_analysis' => 'Weather conditions affecting cameras, model accuracy, hardware failures, public acceptance.',
            'success_metrics' => '30% reduction in wait times, 90% model accuracy, 24/7 uptime, positive public feedback.',
            'progress_percentage' => 45,
            'project_lead_id' => $director->id,
            'trl_level' => 5,
        ]);

        echo "\n✅ Demo data created successfully!\n\n";
        echo "═══════════════════════════════════════════════════════\n";
        echo "📋 DEMO ACCOUNTS\n";
        echo "═══════════════════════════════════════════════════════\n\n";
        
        echo "1️⃣  RESEARCH DIRECTOR (Full Access)\n";
        echo "   Email: director@research.gov\n";
        echo "   Password: password123\n";
        echo "   Name: Dr. Sarah Johnson\n\n";
        
        echo "2️⃣  RESEARCH LEAD (Project Management)\n";
        echo "   Email: lead@research.gov\n";
        echo "   Password: password123\n";
        echo "   Name: Prof. Michael Chen\n\n";
        
        echo "3️⃣  REVIEW COMMITTEE (Screening & Approval)\n";
        echo "   Email: committee@research.gov\n";
        echo "   Password: password123\n";
        echo "   Name: Dr. Emily Brown\n\n";
        
        echo "4️⃣  RESEARCHER (Basic Access)\n";
        echo "   Email: researcher@research.gov\n";
        echo "   Password: password123\n";
        echo "   Name: David Martinez\n\n";
        
        echo "═══════════════════════════════════════════════════════\n";
        echo "📊 DEMO DATA CREATED\n";
        echo "═══════════════════════════════════════════════════════\n\n";
        
        echo "✓ 4 Research Ideas (Various stages)\n";
        echo "✓ 1 Screening Evaluation\n";
        echo "✓ 2 Active Projects\n";
        echo "✓ Complete workflow demonstration\n\n";
        
        echo "═══════════════════════════════════════════════════════\n";
        echo "🚀 TEST SCENARIOS\n";
        echo "═══════════════════════════════════════════════════════\n\n";
        
        echo "Test 1: Create new research idea\n";
        echo "  → Login as Researcher\n";
        echo "  → Submit a new idea\n\n";
        
        echo "Test 2: Screen research idea\n";
        echo "  → Login as Committee member\n";
        echo "  → Evaluate submitted ideas\n\n";
        
        echo "Test 3: Manage projects\n";
        echo "  → Login as Research Lead\n";
        echo "  → View project dashboard\n";
        echo "  → Update project progress\n\n";
        
        echo "Test 4: Workflow transitions\n";
        echo "  → Login as Director\n";
        echo "  → Transition project stages\n";
        echo "  → View workflow history\n\n";
    }

    /**
     * Create sample attachments for research ideas
     */
    protected function createSampleAttachments(ResearchIdea $idea, int $uploadedBy): void
    {
        // Create directory for this research idea
        $directory = "research_ideas/{$idea->id}";
        Storage::disk('public')->makeDirectory($directory);

        // Sample attachment 1: Research Proposal (PDF)
        $proposalContent = $this->generateSamplePdfContent($idea);
        $proposalPath = "{$directory}/research_proposal.pdf";
        Storage::disk('public')->put($proposalPath, $proposalContent);

        ResearchIdeaAttachment::create([
            'research_idea_id' => $idea->id,
            'file_name' => 'research_proposal.pdf',
            'file_path' => $proposalPath,
            'file_type' => 'application/pdf',
            'file_size' => strlen($proposalContent),
            'uploaded_by' => $uploadedBy,
        ]);

        // Sample attachment 2: Budget Document (TXT simulating Excel)
        $budgetContent = $this->generateSampleBudget($idea);
        $budgetPath = "{$directory}/budget_breakdown.txt";
        Storage::disk('public')->put($budgetPath, $budgetContent);

        ResearchIdeaAttachment::create([
            'research_idea_id' => $idea->id,
            'file_name' => 'budget_breakdown.txt',
            'file_path' => $budgetPath,
            'file_type' => 'text/plain',
            'file_size' => strlen($budgetContent),
            'uploaded_by' => $uploadedBy,
        ]);

        // Sample attachment 3: Project Timeline (Image placeholder)
        $timelinePath = "{$directory}/project_timeline.png";
        $this->createSampleImage($timelinePath, 'Project Timeline');

        ResearchIdeaAttachment::create([
            'research_idea_id' => $idea->id,
            'file_name' => 'project_timeline.png',
            'file_path' => $timelinePath,
            'file_type' => 'image/png',
            'file_size' => Storage::disk('public')->size($timelinePath),
            'uploaded_by' => $uploadedBy,
        ]);

        echo "   ✓ Created 3 sample attachments for: {$idea->title}\n";
    }

    /**
     * Generate sample PDF content
     */
    protected function generateSamplePdfContent(ResearchIdea $idea): string
    {
        $priority = $idea->priority instanceof \BackedEnum
            ? $idea->priority->value
            : $idea->priority;

        $category = $idea->research_category instanceof \BackedEnum
            ? $idea->research_category->value
            : $idea->research_category;

        return <<<PDF
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
endobj
4 0 obj
<<
/Length 700
>>
stream
BT
/F1 18 Tf
50 750 Td
(Research Proposal) Tj

0 -30 Td
/F1 12 Tf
(Title: {$idea->title}) Tj

0 -20 Td
(Category: {$category}) Tj

0 -20 Td
(Priority: {$priority}) Tj

0 -30 Td
(Summary:) Tj

0 -20 Td
({$idea->summary}) Tj

0 -30 Td
(Problem Statement:) Tj

0 -20 Td
({$idea->problem_statement}) Tj

0 -30 Td
(Expected Outcome:) Tj

0 -20 Td
({$idea->expected_outcome}) Tj

0 -30 Td
(This is a sample PDF document for testing purposes.) Tj

ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000315 00000 n

trailer
<<
/Size 5
/Root 1 0 R
>>

startxref
865
%%EOF
PDF;
    }

    /**
     * Generate sample budget content
     */
    protected function generateSampleBudget(ResearchIdea $idea): string
    {
        return <<<BUDGET
RESEARCH PROJECT BUDGET BREAKDOWN
==================================

Project: {$idea->title}
Date: {$idea->created_at->format('Y-m-d')}

1. PERSONNEL COSTS
   - Research Lead: $50,000
   - Senior Researchers (2): $80,000
   - Junior Researchers (3): $60,000
   - Technical Staff: $40,000
   Subtotal: $230,000

2. EQUIPMENT & MATERIALS
   - Laboratory Equipment: $150,000
   - Computing Hardware: $80,000
   - Software Licenses: $30,000
   - Materials & Supplies: $40,000
   Subtotal: $300,000

3. OPERATIONAL COSTS
   - Facility Rental: $60,000
   - Utilities: $24,000
   - Communications: $12,000
   - Travel: $50,000
   Subtotal: $146,000

4. OTHER COSTS
   - Training & Workshops: $30,000
   - Contingency (10%): $70,600
   Subtotal: $100,600

TOTAL PROJECT BUDGET: $776,600

This is a sample budget document for testing purposes.
Actual budget details would be more comprehensive.
BUDGET;
    }

    /**
     * Create a simple sample image (1x1 PNG)
     */
    protected function createSampleImage(string $path, string $label): void
    {
        // Create a minimal valid PNG (1x1 transparent pixel)
        $pngData = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        );
        
        Storage::disk('public')->put($path, $pngData);
    }

    /**
     * Ensure all research roles have dashboard permissions
     */
    protected function ensureDashboardPermissions(): void
    {
        $researchRoles = [
            'research_director',
            'research_lead',
            'system_architect',
            'review_committee',
            'researcher',
        ];

        $dashboardPermissions = ['view_dashboard', 'view_research_dashboard'];

        foreach ($researchRoles as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                foreach ($dashboardPermissions as $permName) {
                    $permission = \App\Models\Permission::where('name', $permName)->first();
                    if ($permission && !$role->permissions()->where('permission_id', $permission->id)->exists()) {
                        $role->permissions()->attach($permission->id);
                    }
                }
            }
        }
    }
}
