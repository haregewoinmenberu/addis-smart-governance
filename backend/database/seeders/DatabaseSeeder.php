<?php

namespace Database\Seeders;

use App\Models\Audit;
use App\Models\CybersecurityIssue;
use App\Models\DuplicationCase;
use App\Models\FeasibilityStudy;
use App\Models\Notification;
use App\Models\Report;
use App\Models\RequestItem;
use App\Models\Survey;
use App\Models\Technology;
use App\Models\Vendor;
use App\Models\Workflow;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RolesAndPermissionsSeeder::class,
            SubCityRoleSeeder::class,
            DefaultUsersSeeder::class,
            WorkflowDefinitionsSeeder::class,
        ]);

        // Seed sample data
        Technology::insert([
            ['name' => 'Smart Traffic Management v2', 'category' => 'Transport', 'owner_office' => 'Bole Sub-City', 'status' => 'Active', 'classification' => 'Tier-1', 'location' => 'Bole', 'deployed_at' => '2025-02-10', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Citizen Feedback Portal', 'category' => 'Citizen Services', 'owner_office' => 'ITDB Central', 'status' => 'Active', 'classification' => 'Tier-2', 'location' => 'ITDB', 'deployed_at' => '2024-11-20', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'e-Permit Issuance Platform', 'category' => 'Permitting', 'owner_office' => 'Arada Sub-City', 'status' => 'In review', 'classification' => 'Tier-2', 'location' => 'Arada', 'deployed_at' => '2025-01-15', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Municipal Asset Tracker', 'category' => 'Assets', 'owner_office' => 'Kirkos Sub-City', 'status' => 'Paused', 'classification' => 'Tier-3', 'location' => 'Kirkos', 'deployed_at' => '2023-09-12', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Waste Routing AI', 'category' => 'Sanitation', 'owner_office' => 'Yeka Sub-City', 'status' => 'Pending', 'classification' => 'Tier-2', 'location' => 'Yeka', 'deployed_at' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);

        RequestItem::insert([
            ['code' => 'TR-2025-0142', 'title' => 'Smart Traffic Management v2', 'office' => 'Bole Sub-City', 'status' => 'In review', 'step' => 3, 'total_steps' => 5, 'budget' => 12400000, 'submitted_at' => '2025-09-12', 'priority' => 'High', 'description' => 'Upgrade corridor signal control with AI optimization.', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'TR-2025-0141', 'title' => 'Citizen Feedback Mobile App', 'office' => 'ITDB Central', 'status' => 'Approved', 'step' => 5, 'total_steps' => 5, 'budget' => 4800000, 'submitted_at' => '2025-09-10', 'priority' => 'Medium', 'description' => 'Expand citizen feedback to mobile channels.', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'TR-2025-0140', 'title' => 'Municipal Asset Tracker', 'office' => 'Kirkos Sub-City', 'status' => 'Rejected', 'step' => 4, 'total_steps' => 5, 'budget' => 9100000, 'submitted_at' => '2025-09-09', 'priority' => 'Medium', 'description' => 'Citywide asset tracking with IoT sensors.', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'TR-2025-0139', 'title' => 'Waste Routing AI Platform', 'office' => 'Yeka Sub-City', 'status' => 'Pending', 'step' => 1, 'total_steps' => 5, 'budget' => 18700000, 'submitted_at' => '2025-09-08', 'priority' => 'High', 'description' => 'AI routing optimization for sanitation fleet.', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'TR-2025-0138', 'title' => 'e-Permit Issuance Portal', 'office' => 'Arada Sub-City', 'status' => 'In review', 'step' => 2, 'total_steps' => 5, 'budget' => 7600000, 'submitted_at' => '2025-09-06', 'priority' => 'Low', 'description' => 'Digitize permit issuance workflow.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Vendor::insert([
            ['name' => 'Sheba Tech', 'status' => 'At risk', 'score' => 61, 'active_projects' => 4, 'sla_breaches' => 2, 'last_reviewed_at' => '2025-08-22', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Addis Digital', 'status' => 'Active', 'score' => 88, 'active_projects' => 7, 'sla_breaches' => 0, 'last_reviewed_at' => '2025-09-02', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Blue Nile Systems', 'status' => 'Active', 'score' => 79, 'active_projects' => 3, 'sla_breaches' => 1, 'last_reviewed_at' => '2025-08-30', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Workflow::insert([
            ['name' => 'Procurement Approval', 'stages' => 6, 'active' => true, 'owner_office' => 'ITDB Central', 'last_run_at' => '2025-09-11', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cyber Incident Response', 'stages' => 4, 'active' => true, 'owner_office' => 'Security Ops', 'last_run_at' => '2025-09-10', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Vendor Onboarding', 'stages' => 5, 'active' => false, 'owner_office' => 'Procurement', 'last_run_at' => '2025-08-28', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Survey::insert([
            ['title' => 'Digital Services Satisfaction Q3', 'responses' => 812, 'sentiment' => 'Positive', 'status' => 'Active', 'created_by' => 'Citizen Engagement', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Vendor Performance Feedback', 'responses' => 221, 'sentiment' => 'Mixed', 'status' => 'Closed', 'created_by' => 'Procurement', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Cyber Awareness Pulse', 'responses' => 498, 'sentiment' => 'Neutral', 'status' => 'Active', 'created_by' => 'Security Ops', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Report::insert([
            ['title' => 'Infrastructure Investment Report', 'type' => 'Finance', 'period' => 'FY 2025', 'status' => 'Published', 'generated_at' => '2025-09-01 09:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Cybersecurity Posture Summary', 'type' => 'Security', 'period' => 'Aug 2025', 'status' => 'Published', 'generated_at' => '2025-08-28 10:30:00', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Vendor SLA Review', 'type' => 'Procurement', 'period' => 'Q3 2025', 'status' => 'Draft', 'generated_at' => '2025-09-06 14:15:00', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Notification::insert([
            ['title' => 'Audit due in 5 days', 'message' => 'Arada Sub-City audit is due on Sep 18.', 'channel' => 'Email', 'priority' => 'High', 'recipient' => 'audit@addis.gov.et', 'read_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'New request submitted', 'message' => 'TR-2025-0142 submitted by Bole Sub-City.', 'channel' => 'In-app', 'priority' => 'Medium', 'recipient' => 'procurement@addis.gov.et', 'read_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Vulnerability resolved', 'message' => 'Critical patch applied to Traffic Management v2.', 'channel' => 'SMS', 'priority' => 'Low', 'recipient' => 'security@addis.gov.et', 'read_at' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        Audit::insert([
            ['title' => 'Kirkos Data Center Audit', 'office' => 'Kirkos Sub-City', 'status' => 'Scheduled', 'score' => null, 'due_date' => '2025-09-18', 'started_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Yeka Cyber Compliance', 'office' => 'Yeka Sub-City', 'status' => 'In progress', 'score' => 78, 'due_date' => '2025-09-30', 'started_at' => '2025-09-05', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bole Procurement Review', 'office' => 'Bole Sub-City', 'status' => 'Completed', 'score' => 91, 'due_date' => '2025-08-20', 'started_at' => '2025-08-10', 'created_at' => now(), 'updated_at' => now()],
        ]);

        CybersecurityIssue::insert([
            ['title' => 'Unpatched firewall rules', 'system' => 'ITDB Core', 'severity' => 'High', 'status' => 'Open', 'detected_at' => '2025-09-07 08:30:00', 'resolved_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Legacy TLS usage', 'system' => 'Citizen Feedback Portal', 'severity' => 'Medium', 'status' => 'Mitigated', 'detected_at' => '2025-08-29 12:00:00', 'resolved_at' => '2025-09-03 16:20:00', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Malware alert', 'system' => 'Permit Issuance', 'severity' => 'Low', 'status' => 'Resolved', 'detected_at' => '2025-08-20 09:45:00', 'resolved_at' => '2025-08-20 11:10:00', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DuplicationCase::insert([
            ['title' => 'ERP procurement overlap', 'systems' => json_encode(['Bole ERP', 'Kirkos ERP']), 'similarity_score' => 88.5, 'status' => 'Open', 'recommendation' => 'Consolidate procurement.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Citizen service portal duplication', 'systems' => json_encode(['ITDB Portal', 'Yeka Portal']), 'similarity_score' => 72.4, 'status' => 'In review', 'recommendation' => 'Merge service catalog.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Asset tracking platforms', 'systems' => json_encode(['Kirkos Tracker', 'Arada Assets']), 'similarity_score' => 64.2, 'status' => 'Closed', 'recommendation' => 'Standardize data model.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        FeasibilityStudy::insert([
            ['title' => 'Smart Waste Routing AI', 'office' => 'Yeka Sub-City', 'status' => 'Approved', 'score' => 84, 'reviewed_at' => '2025-09-04', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Digital Permit Expansion', 'office' => 'Arada Sub-City', 'status' => 'In review', 'score' => 72, 'reviewed_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Citywide Data Exchange', 'office' => 'ITDB Central', 'status' => 'Pending', 'score' => null, 'reviewed_at' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
