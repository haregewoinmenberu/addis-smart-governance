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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ResearchDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();

        try {

            $this->command->info('Seeding Research Demo Data...');

            // Ensure dashboard permissions
            $this->ensureDashboardPermissions();


            /*
            |--------------------------------------------------------------------------
            | Create Demo Users
            |--------------------------------------------------------------------------
            */

            $users = $this->createDemoUsers();

            $this->command->info('✓ Research users created');


            /*
            |--------------------------------------------------------------------------
            | Create Research Data
            |--------------------------------------------------------------------------
            */

            $researchData = $this->createResearchData($users);


            DB::commit();


            $this->command->info('');
            $this->command->info('====================================');
            $this->command->info('Research Demo Data Completed');
            $this->command->info('====================================');

            $this->displayDemoCredentials();


        } catch (\Exception $e) {

            DB::rollBack();

            $this->command->error(
                'Research Demo Seeder Error: '.$e->getMessage()
            );

            throw $e;
        }
    }



    /**
     * Create demo users and assign existing roles
     */
    protected function createDemoUsers(): array
    {
        $users = [];


        /*
        |--------------------------------------------------------------------------
        | Research Manager
        |--------------------------------------------------------------------------
        */

        $director = User::firstOrCreate(
            [
                'email'=>'director@research.gov'
            ],
            [
                'name'=>'Dr. Sarah Johnson',
                'password'=>Hash::make('password123'),
                'is_active'=>true,
            ]
        );


        $this->assignRole(
            $director,
            'research_manager'
        );


        $users['manager']=$director;



        /*
        |--------------------------------------------------------------------------
        | Research Officer
        |--------------------------------------------------------------------------
        */

        $lead = User::firstOrCreate(
            [
                'email'=>'lead@research.gov'
            ],
            [
                'name'=>'Prof. Michael Chen',
                'password'=>Hash::make('password123'),
                'is_active'=>true,
            ]
        );


        $this->assignRole(
            $lead,
            'research_officer'
        );


        $users['officer']=$lead;



        /*
        |--------------------------------------------------------------------------
        | Research Reviewer
        |--------------------------------------------------------------------------
        */

        $committee = User::firstOrCreate(
            [
                'email'=>'committee@research.gov'
            ],
            [
                'name'=>'Dr. Emily Brown',
                'password'=>Hash::make('password123'),
                'is_active'=>true,
            ]
        );


        $this->assignRole(
            $committee,
            'research_reviewer'
        );


        $users['reviewer']=$committee;




        /*
        |--------------------------------------------------------------------------
        | Researcher
        |--------------------------------------------------------------------------
        */

        $researcher = User::firstOrCreate(
            [
                'email'=>'researcher@research.gov'
            ],
            [
                'name'=>'David Martinez',
                'password'=>Hash::make('password123'),
                'is_active'=>true,
            ]
        );


        $this->assignRole(
            $researcher,
            'researcher'
        );


        $users['researcher']=$researcher;



        return $users;
    }





    /**
     * Assign existing role safely
     */
    protected function assignRole(
        User $user,
        string $roleName
    ): void
    {

        $role = Role::where(
            'name',
            $roleName
        )->first();


        if(!$role){
            $this->command->warn(
                "Role {$roleName} not found"
            );

            return;
        }



        DB::table('role_user')
            ->updateOrInsert(
                [
                    'user_id'=>$user->id,
                    'role_id'=>$role->id,
                ],
                [
                    'user_id'=>$user->id,
                    'role_id'=>$role->id,
                ]
            );
    }






    /**
     * Create Research Ideas, Screening and Projects
     */ 
    protected function createResearchData(array $users): array
    {

        /*
        |--------------------------------------------------------------------------
        | Create Research Ideas
        |--------------------------------------------------------------------------
        */


        $idea1 = ResearchIdea::create([

            'title' => 'AI-Powered Smart Traffic Management System',

            'summary' =>
            'Develop an intelligent traffic management system using machine learning to optimize traffic flow and reduce congestion in urban areas.',

            'problem_statement' =>
            'Current traffic management systems are reactive rather than proactive, causing congestion during peak hours.',

            'objectives' =>
            'Design an AI-based system that predicts traffic patterns and optimizes signal timing.',

            'expected_outcome' =>
            'Deploy smart traffic control system in pilot intersections.',


            'research_category' =>
            ResearchCategory::APPLIED_RESEARCH->value,


            'government_sector' =>
            'Transportation',


            'priority' =>
            Priority::HIGH->value,


            'status' =>
            IdeaStatus::SUBMITTED->value,


            'submitted_by' =>
            $users['researcher']->id,


            'submitted_at' =>
            now()->subDays(5),

        ]);





        $idea2 = ResearchIdea::create([

            'title' =>
            'Blockchain-Based Land Registry System',


            'summary' =>
            'Create a secure transparent land registration system using blockchain technology.',


            'problem_statement' =>
            'Existing land registry systems are vulnerable to fraud and lack transparency.',


            'objectives' =>
            'Develop blockchain platform for secure ownership verification.',


            'expected_outcome' =>
            'Pilot blockchain registry managing land records.',


            'research_category' =>
            ResearchCategory::INNOVATION->value,


            'government_sector' =>
            'Land Administration',


            'priority' =>
            Priority::CRITICAL->value,


            'status' =>
            IdeaStatus::APPROVED->value,


            'submitted_by' =>
            $users['officer']->id,


            'submitted_at' =>
            now()->subDays(10),

        ]);






        $idea3 = ResearchIdea::create([


            'title' =>
            'Solar Powered Water Purification System',


            'summary' =>
            'Affordable solar-powered water purification for rural communities.',


            'problem_statement' =>
            'Many rural communities lack access to clean drinking water.',


            'objectives' =>
            'Develop low-cost purification technology.',


            'expected_outcome' =>
            'Install prototype systems in rural communities.',


            'research_category' =>
            ResearchCategory::EXPERIMENTAL_DEVELOPMENT->value,


            'government_sector' =>
            'Health and Water',


            'priority' =>
            Priority::HIGH->value,


            'status' =>
            IdeaStatus::UNDER_REVIEW->value,


            'submitted_by' =>
            $users['researcher']->id,


            'submitted_at' =>
            now()->subDays(3),

        ]);






        $idea4 = ResearchIdea::create([


            'title' =>
            'E-Learning Platform for Remote Education',


            'summary' =>
            'Offline capable digital learning platform for remote students.',


            'problem_statement' =>
            'Students in rural areas have limited access to educational resources.',


            'objectives' =>
            'Create bandwidth optimized learning platform.',


            'expected_outcome' =>
            'Deploy platform in multiple schools.',


            'research_category' =>
            ResearchCategory::PILOT_PROJECT->value,


            'government_sector' =>
            'Education',


            'priority' =>
            Priority::MEDIUM->value,


            'status' =>
            IdeaStatus::DRAFT->value,


            'submitted_by' =>
            $users['officer']->id,


            'submitted_at' =>
            null,

        ]);






        /*
        |--------------------------------------------------------------------------
        | Create Screening
        |--------------------------------------------------------------------------
        */


        ResearchScreening::create([


            'research_idea_id' =>
            $idea2->id,


            'evaluated_by' =>
            $users['reviewer']->id,


            'strategic_alignment_score' =>
            10,


            'strategic_alignment_comment' =>
            'Aligned with digital transformation strategy',


            'feasibility_score' =>
            8,


            'feasibility_comment' =>
            'Technology implementation is feasible',


            'governance_impact_score' =>
            10,


            'governance_impact_comment' =>
            'Improves transparency and governance',


            'resource_requirement_score' =>
            7,


            'resource_requirement_comment' =>
            'Requires moderate investment',


            'innovation_level_score' =>
            9,


            'innovation_level_comment' =>
            'Innovative blockchain application',


            'risk_level_score' =>
            6,


            'risk_level_comment' =>
            'Manageable technical risks',


            'decision' =>
            ApprovalDecision::APPROVED->value,


            'overall_comment' =>
            'Recommended for implementation.',

        ]);








        /*
        |--------------------------------------------------------------------------
        | Create Projects
        |--------------------------------------------------------------------------
        */


        $project1 = ResearchProject::create([


            'research_idea_id' =>
            $idea2->id,


            'title' =>
            $idea2->title,


            'current_stage' =>
            ResearchStage::PROPOSAL_DEVELOPMENT->value,


            'background' =>
            'Blockchain technology improves land ownership security.',


            'objectives' =>
            'Develop blockchain land registry pilot.',


            'methodology' =>
            'Agile development using blockchain and REST APIs.',


            'expected_deliverables' =>
            'Platform, mobile app and training materials.',


            'estimated_budget' =>
            2500000,


            'required_resources' =>
            'Developers, designers and cloud infrastructure.',


            'start_date' =>
            now()->addDays(10),


            'end_date' =>
            now()->addMonths(12),


            'risk_analysis' =>
            'Stakeholder adoption and integration risks.',


            'success_metrics' =>
            '1000 registered properties.',


            'progress_percentage' =>
            15,


            'project_lead_id' =>
            $users['officer']->id,


            'trl_level' =>
            3,

        ]);







        $project2 = ResearchProject::create([


            'research_idea_id' =>
            $idea1->id,


            'title' =>
            $idea1->title,


            'current_stage' =>
            ResearchStage::EXECUTION->value,


            'background' =>
            'Traffic congestion reduction project.',


            'objectives' =>
            'Reduce traffic waiting time using AI.',


            'methodology' =>
            'Machine learning and computer vision.',


            'expected_deliverables' =>
            'AI models and traffic dashboard.',


            'estimated_budget' =>
            1800000,


            'required_resources' =>
            'ML engineers and infrastructure.',


            'start_date' =>
            now()->subMonths(2),


            'end_date' =>
            now()->addMonths(10),


            'risk_analysis' =>
            'Hardware and accuracy risks.',


            'success_metrics' =>
            '30% congestion reduction.',


            'progress_percentage' =>
            45,


            'project_lead_id' =>
            $users['manager']->id,


            'trl_level' =>
            5,

        ]);



        return [

            'ideas' => [
                $idea1,
                $idea2,
                $idea3,
                $idea4
            ],


            'projects' => [
                $project1,
                $project2
            ]

        ];
    }
    /**
     * Create sample attachments
     */
    protected function createSampleAttachments(
        ResearchIdea $idea,
        int $uploadedBy
    ): void {

        $directory = "research_ideas/{$idea->id}";

        Storage::disk('public')
            ->makeDirectory($directory);



        /*
        |--------------------------------------------------------------------------
        | Proposal PDF
        |--------------------------------------------------------------------------
        */

        $proposalContent = $this->generateSamplePdfContent($idea);

        $proposalPath =
            "{$directory}/research_proposal.pdf";


        Storage::disk('public')
            ->put(
                $proposalPath,
                $proposalContent
            );



        ResearchIdeaAttachment::create([

            'research_idea_id' => $idea->id,

            'file_name' => 'research_proposal.pdf',

            'file_path' => $proposalPath,

            'file_type' => 'application/pdf',

            'file_size' => strlen($proposalContent),

            'uploaded_by' => $uploadedBy,

        ]);





        /*
        |--------------------------------------------------------------------------
        | Budget File
        |--------------------------------------------------------------------------
        */


        $budgetContent =
            $this->generateSampleBudget($idea);


        $budgetPath =
            "{$directory}/budget.txt";


        Storage::disk('public')
            ->put(
                $budgetPath,
                $budgetContent
            );



        ResearchIdeaAttachment::create([


            'research_idea_id' => $idea->id,


            'file_name' => 'budget.txt',


            'file_path' => $budgetPath,


            'file_type' => 'text/plain',


            'file_size' => strlen($budgetContent),


            'uploaded_by' => $uploadedBy,


        ]);
    }







    /**
     * Generate demo PDF content
     */
    protected function generateSamplePdfContent(
        ResearchIdea $idea
    ): string {


        $priority =
            $idea->priority instanceof \BackedEnum
            ? $idea->priority->value
            : $idea->priority;


        $category =
            $idea->research_category instanceof \BackedEnum
            ? $idea->research_category->value
            : $idea->research_category;



        return <<<PDF
%PDF-1.4

Research Proposal

Title:
{$idea->title}

Category:
{$category}

Priority:
{$priority}

Summary:
{$idea->summary}

Problem:
{$idea->problem_statement}

Expected Outcome:
{$idea->expected_outcome}

Generated Demo Document

%%EOF
PDF;
    }







    /**
     * Generate budget document
     */
    protected function generateSampleBudget(
        ResearchIdea $idea
    ): string {


        return <<<TXT

RESEARCH PROJECT BUDGET
========================

Project:
{$idea->title}


PERSONNEL
----------
Research Lead       : 50,000 USD
Researchers         : 140,000 USD
Technical Staff     : 40,000 USD


EQUIPMENT
----------
Hardware            : 80,000 USD
Software            : 30,000 USD


OPERATION
----------
Training            : 30,000 USD
Travel              : 20,000 USD


TOTAL:
390,000 USD


Demo budget file.

TXT;
    }







    /**
     * Create sample image
     */
    protected function createSampleImage(
        string $path,
        string $label
    ): void {


        $png =
            base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            );


        Storage::disk('public')
            ->put(
                $path,
                $png
            );
    }







    /**
     * Display demo login information
     */
    protected function displayDemoCredentials(): void
    {

        $this->command->info('');

        $this->command->info(
            '=============================='
        );

        $this->command->info(
            'RESEARCH DEMO ACCOUNTS'
        );

        $this->command->info(
            '=============================='
        );


        $this->command->info(
            'Research Manager'
        );

        $this->command->info(
            'director@research.gov / password123'
        );



        $this->command->info(
            'Research Officer'
        );

        $this->command->info(
            'lead@research.gov / password123'
        );



        $this->command->info(
            'Research Reviewer'
        );

        $this->command->info(
            'committee@research.gov / password123'
        );



        $this->command->info(
            'Researcher'
        );

        $this->command->info(
            'researcher@research.gov / password123'
        );


        $this->command->info('');
    }








    /**
     * Attach dashboard permissions to research roles
     */
    protected function ensureDashboardPermissions(): void
    {


        $researchRoles = [

            'research_manager',

            'research_officer',

            'research_reviewer',

            'researcher',

        ];



        $dashboardPermissions = [

            'view_dashboard',

            'view_research_dashboard',

        ];





        foreach ($researchRoles as $roleName) {


            $role =
                Role::where(
                    'name',
                    $roleName
                )->first();



            if (!$role) {
                continue;
            }




            foreach ($dashboardPermissions as $permissionName) {



                $permission =
                    \App\Models\Permission::where(
                        'name',
                        $permissionName
                    )->first();



                if (
                    $permission &&
                    !$role->permissions()
                        ->where(
                            'permission_id',
                            $permission->id
                        )
                        ->exists()
                ) {


                    $role->permissions()
                        ->attach(
                            $permission->id
                        );
                }
            }
        }
    }
}
