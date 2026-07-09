<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class ProfessionalLicensingPermissionSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();
        
        try {
            // Professional Licensing Permissions
            $permissions = [
                // Application Management
                ['name' => 'view_license_applications', 'display_name' => 'View License Applications', 'module' => 'professional_licensing'],
                ['name' => 'create_license_application', 'display_name' => 'Create License Application', 'module' => 'professional_licensing'],
                ['name' => 'update_license_application', 'display_name' => 'Update License Application', 'module' => 'professional_licensing'],
                ['name' => 'delete_license_application', 'display_name' => 'Delete License Application', 'module' => 'professional_licensing'],
                ['name' => 'submit_license_application', 'display_name' => 'Submit License Application', 'module' => 'professional_licensing'],
                ['name' => 'review_license_application', 'display_name' => 'Review License Application', 'module' => 'professional_licensing'],
                ['name' => 'approve_license_application', 'display_name' => 'Approve License Application', 'module' => 'professional_licensing'],
                ['name' => 'reject_license_application', 'display_name' => 'Reject License Application', 'module' => 'professional_licensing'],

                // Verification
                ['name' => 'view_verifications', 'display_name' => 'View Verifications', 'module' => 'professional_licensing'],
                ['name' => 'create_verification', 'display_name' => 'Create Verification', 'module' => 'professional_licensing'],
                ['name' => 'assign_verifier', 'display_name' => 'Assign Verifier', 'module' => 'professional_licensing'],
                ['name' => 'complete_verification', 'display_name' => 'Complete Verification', 'module' => 'professional_licensing'],

                // License Management
                ['name' => 'view_licenses', 'display_name' => 'View Licenses', 'module' => 'professional_licensing'],
                ['name' => 'issue_license', 'display_name' => 'Issue License', 'module' => 'professional_licensing'],
                ['name' => 'renew_license', 'display_name' => 'Renew License', 'module' => 'professional_licensing'],
                ['name' => 'suspend_license', 'display_name' => 'Suspend License', 'module' => 'professional_licensing'],
                ['name' => 'revoke_license', 'display_name' => 'Revoke License', 'module' => 'professional_licensing'],
                ['name' => 'reactivate_license', 'display_name' => 'Reactivate License', 'module' => 'professional_licensing'],
                ['name' => 'verify_license', 'display_name' => 'Verify License', 'module' => 'professional_licensing'],
                ['name' => 'download_license_certificate', 'display_name' => 'Download License Certificate', 'module' => 'professional_licensing'],

                // Examination Management
                ['name' => 'view_examinations', 'display_name' => 'View Examinations', 'module' => 'professional_licensing'],
                ['name' => 'create_examination', 'display_name' => 'Create Examination', 'module' => 'professional_licensing'],
                ['name' => 'update_examination', 'display_name' => 'Update Examination', 'module' => 'professional_licensing'],
                ['name' => 'delete_examination', 'display_name' => 'Delete Examination', 'module' => 'professional_licensing'],
                ['name' => 'register_for_exam', 'display_name' => 'Register for Exam', 'module' => 'professional_licensing'],
                ['name' => 'evaluate_exam', 'display_name' => 'Evaluate Exam', 'module' => 'professional_licensing'],
                ['name' => 'file_exam_appeal', 'display_name' => 'File Exam Appeal', 'module' => 'professional_licensing'],

                // Complaint Management
                ['name' => 'view_complaints', 'display_name' => 'View Complaints', 'module' => 'professional_licensing'],
                ['name' => 'file_complaint', 'display_name' => 'File Complaint', 'module' => 'professional_licensing'],
                ['name' => 'assign_complaint_investigator', 'display_name' => 'Assign Complaint Investigator', 'module' => 'professional_licensing'],
                ['name' => 'investigate_complaint', 'display_name' => 'Investigate Complaint', 'module' => 'professional_licensing'],
                ['name' => 'dismiss_complaint', 'display_name' => 'Dismiss Complaint', 'module' => 'professional_licensing'],

                // Disciplinary Case Management
                ['name' => 'view_disciplinary_cases', 'display_name' => 'View Disciplinary Cases', 'module' => 'professional_licensing'],
                ['name' => 'create_disciplinary_case', 'display_name' => 'Create Disciplinary Case', 'module' => 'professional_licensing'],
                ['name' => 'schedule_hearing', 'display_name' => 'Schedule Hearing', 'module' => 'professional_licensing'],
                ['name' => 'conduct_hearing', 'display_name' => 'Conduct Hearing', 'module' => 'professional_licensing'],
                ['name' => 'record_hearing_decision', 'display_name' => 'Record Hearing Decision', 'module' => 'professional_licensing'],
                ['name' => 'impose_disciplinary_action', 'display_name' => 'Impose Disciplinary Action', 'module' => 'professional_licensing'],

                // Professional Profile
                ['name' => 'view_professional_profiles', 'display_name' => 'View Professional Profiles', 'module' => 'professional_licensing'],
                ['name' => 'update_professional_profile', 'display_name' => 'Update Professional Profile', 'module' => 'professional_licensing'],
                ['name' => 'search_professionals', 'display_name' => 'Search Professionals', 'module' => 'professional_licensing'],

                // Profession & Specialization Management
                ['name' => 'view_professions', 'display_name' => 'View Professions', 'module' => 'professional_licensing'],
                ['name' => 'manage_professions', 'display_name' => 'Manage Professions', 'module' => 'professional_licensing'],
                ['name' => 'manage_specializations', 'display_name' => 'Manage Specializations', 'module' => 'professional_licensing'],

                // Continuing Education
                ['name' => 'view_continuing_education', 'display_name' => 'View Continuing Education', 'module' => 'professional_licensing'],
                ['name' => 'record_continuing_education', 'display_name' => 'Record Continuing Education', 'module' => 'professional_licensing'],
                ['name' => 'verify_continuing_education', 'display_name' => 'Verify Continuing Education', 'module' => 'professional_licensing'],

                // Reports & Analytics
                ['name' => 'view_licensing_reports', 'display_name' => 'View Licensing Reports', 'module' => 'professional_licensing'],
                ['name' => 'export_licensing_data', 'display_name' => 'Export Licensing Data', 'module' => 'professional_licensing'],
            ];

            foreach ($permissions as $permissionData) {
                Permission::firstOrCreate(
                    ['name' => $permissionData['name']],
                    $permissionData
                );
            }

            // Create Roles
            $this->createRoles();

            DB::commit();
            
            $this->command->info('Professional Licensing permissions and roles seeded successfully!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding permissions: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function createRoles(): void
    {
        // Licensing Authority Role
        $licensingAuthority = Role::firstOrCreate(
            ['name' => 'licensing_authority'],
            [
                'display_name' => 'Licensing Authority',
                'description' => 'Full access to licensing management'
            ]
        );

        $licensingAuthorityPermissions = [
            'view_license_applications',
            'review_license_application',
            'approve_license_application',
            'reject_license_application',
            'view_licenses',
            'issue_license',
            'renew_license',
            'suspend_license',
            'revoke_license',
            'reactivate_license',
            'verify_license',
            'view_examinations',
            'view_complaints',
            'view_disciplinary_cases',
            'view_professional_profiles',
            'view_professions',
            'view_licensing_reports',
        ];

        $this->assignPermissionsToRole($licensingAuthority, $licensingAuthorityPermissions);

        // Verification Officer Role
        $verificationOfficer = Role::firstOrCreate(
            ['name' => 'verification_officer'],
            [
                'display_name' => 'Verification Officer',
                'description' => 'Handles application verification'
            ]
        );

        $verificationOfficerPermissions = [
            'view_license_applications',
            'view_verifications',
            'complete_verification',
            'view_professional_profiles',
        ];

        $this->assignPermissionsToRole($verificationOfficer, $verificationOfficerPermissions);

        // Exam Officer Role
        $examOfficer = Role::firstOrCreate(
            ['name' => 'exam_officer'],
            [
                'display_name' => 'Exam Officer',
                'description' => 'Manages examinations'
            ]
        );

        $examOfficerPermissions = [
            'view_examinations',
            'create_examination',
            'update_examination',
            'evaluate_exam',
            'view_license_applications',
        ];

        $this->assignPermissionsToRole($examOfficer, $examOfficerPermissions);

        // Disciplinary Committee Role
        $disciplinaryCommittee = Role::firstOrCreate(
            ['name' => 'disciplinary_committee'],
            [
                'display_name' => 'Disciplinary Committee',
                'description' => 'Handles disciplinary cases'
            ]
        );

        $disciplinaryCommitteePermissions = [
            'view_complaints',
            'assign_complaint_investigator',
            'investigate_complaint',
            'dismiss_complaint',
            'view_disciplinary_cases',
            'create_disciplinary_case',
            'schedule_hearing',
            'conduct_hearing',
            'record_hearing_decision',
            'impose_disciplinary_action',
            'suspend_license',
            'revoke_license',
            'view_licenses',
            'view_professional_profiles',
        ];

        $this->assignPermissionsToRole($disciplinaryCommittee, $disciplinaryCommitteePermissions);

        // Professional Applicant Role
        $professionalApplicant = Role::firstOrCreate(
            ['name' => 'professional_applicant'],
            [
                'display_name' => 'Professional Applicant',
                'description' => 'Professionals applying for licenses'
            ]
        );

        $professionalApplicantPermissions = [
            'view_license_applications', // own only
            'create_license_application',
            'update_license_application', // own only
            'submit_license_application',
            'view_professions',
            'view_examinations',
            'register_for_exam',
            'file_exam_appeal',
            'view_continuing_education',
            'record_continuing_education',
            'update_professional_profile',
            'verify_license', // public
        ];

        $this->assignPermissionsToRole($professionalApplicant, $professionalApplicantPermissions);

        // Public User Role
        $publicUser = Role::firstOrCreate(
            ['name' => 'public_user'],
            [
                'display_name' => 'Public User',
                'description' => 'Public access for license verification'
            ]
        );

        $publicUserPermissions = [
            'verify_license',
            'search_professionals',
            'view_professions',
            'file_complaint',
        ];

        $this->assignPermissionsToRole($publicUser, $publicUserPermissions);

        // System Administrator - add licensing permissions
        $admin = Role::where('name', 'itdb_administrator')->first();
        if ($admin) {
            $allPermissions = Permission::where('module', 'professional_licensing')->pluck('name')->toArray();
            $this->assignPermissionsToRole($admin, $allPermissions);
        }
    }

    protected function assignPermissionsToRole(Role $role, array $permissionNames): void
    {
        $permissions = Permission::whereIn('name', $permissionNames)->get();
        
        foreach ($permissions as $permission) {
            // Use direct DB insert to avoid conflicts with permission_role table
            DB::table('permission_role')->updateOrInsert(
                [
                    'role_id' => $role->id,
                    'permission_id' => $permission->id,
                ],
                [
                    'role_id' => $role->id,
                    'permission_id' => $permission->id,
                ]
            );
        }
    }
}
