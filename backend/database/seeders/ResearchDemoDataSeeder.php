<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\ResearchIdea;
use App\Models\ResearchProject;
use App\Models\ResearchScreening;
use App\Enums\IdeaStatus;
use App\Enums\Priority;
use App\Enums\ResearchCategory;
use App\Enums\ResearchStage;
use App\Enums\ApprovalDecision;
use Illuminate\Support\Facades\Hash;

class ResearchDemoDataSeeder extends Seeder
{
    public function run(): void
    {
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
}
