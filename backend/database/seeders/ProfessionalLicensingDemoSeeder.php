<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Profession;
use App\Models\Specialization;
use App\Models\LicenseApplication;
use App\Models\License;
use App\Models\Examination;
use App\Models\ExamAttempt;
use App\Models\ProfessionalProfile;
use App\Models\Complaint;
use App\Models\ProfessionalDocument;
use App\Models\EducationalRecord;
use App\Models\ExperienceRecord;
use App\Models\VerificationRequest;
use App\Enums\ApplicationStatus;
use App\Enums\LicenseStatus;
use App\Enums\VerificationStatus;
use App\Enums\VerificationType;
use App\Enums\ComplaintStatus;
use App\Enums\ViolationType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfessionalLicensingDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();

        try {
            $this->command->info('Seeding Professional Licensing Demo Data...');

            // Create demo users
            $users = $this->createDemoUsers();
            $this->command->info('✓ Demo users created');

            // Create professions and specializations
            $professions = $this->createProfessions();
            $this->command->info('✓ Professions created');

            // Create examinations
            $examinations = $this->createExaminations($professions);
            $this->command->info('✓ Examinations created');

            // Create applications
            $applications = $this->createApplications($users, $professions);
            $this->command->info('✓ Applications created');

            // Create licenses
            $licenses = $this->createLicenses($applications, $users);
            $this->command->info('✓ Licenses created');

            // Create complaints
            $this->createComplaints($users, $licenses);
            $this->command->info('✓ Complaints created');

            DB::commit();

            $this->command->info('Professional Licensing Demo Data seeded successfully!');
            $this->displayDemoCredentials($users);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding demo data: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function createDemoUsers(): array
    {
        $users = [];

        // Licensing Authority
        $licensingAuthority = User::firstOrCreate(
            ['email' => 'licensing@gov.et'],
            [
                'name' => 'License Authority',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        $role = Role::where('name', 'licensing_authority')->first();
        if ($role) {
            DB::table('role_user')->updateOrInsert(
                ['user_id' => $licensingAuthority->id, 'role_id' => $role->id],
                ['user_id' => $licensingAuthority->id, 'role_id' => $role->id]
            );
        }
        $users['licensing_authority'] = $licensingAuthority;

        // Verification Officer
        $verificationOfficer = User::firstOrCreate(
            ['email' => 'verifier@gov.et'],
            [
                'name' => 'Verification Officer',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        $role = Role::where('name', 'verification_officer')->first();
        if ($role) {
            DB::table('role_user')->updateOrInsert(
                ['user_id' => $verificationOfficer->id, 'role_id' => $role->id],
                ['user_id' => $verificationOfficer->id, 'role_id' => $role->id]
            );
        }
        $users['verification_officer'] = $verificationOfficer;

        // Exam Officer
        $examOfficer = User::firstOrCreate(
            ['email' => 'examiner@gov.et'],
            [
                'name' => 'Exam Officer',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        $role = Role::where('name', 'exam_officer')->first();
        if ($role) {
            DB::table('role_user')->updateOrInsert(
                ['user_id' => $examOfficer->id, 'role_id' => $role->id],
                ['user_id' => $examOfficer->id, 'role_id' => $role->id]
            );
        }
        $users['exam_officer'] = $examOfficer;

        // Disciplinary Committee Member
        $disciplinaryOfficer = User::firstOrCreate(
            ['email' => 'disciplinary@gov.et'],
            [
                'name' => 'Disciplinary Committee',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        $role = Role::where('name', 'disciplinary_committee')->first();
        if ($role) {
            DB::table('role_user')->updateOrInsert(
                ['user_id' => $disciplinaryOfficer->id, 'role_id' => $role->id],
                ['user_id' => $disciplinaryOfficer->id, 'role_id' => $role->id]
            );
        }
        $users['disciplinary_officer'] = $disciplinaryOfficer;

        // Professional Applicants
        $applicants = [];
        for ($i = 1; $i <= 5; $i++) {
            $applicant = User::firstOrCreate(
                ['email' => "applicant{$i}@example.com"],
                [
                    'name' => "Professional Applicant {$i}",
                    'password' => Hash::make('password123'),
                    'is_active' => true,
                ]
            );
            $role = Role::where('name', 'professional_applicant')->first();
            if ($role) {
                DB::table('role_user')->updateOrInsert(
                    ['user_id' => $applicant->id, 'role_id' => $role->id],
                    ['user_id' => $applicant->id, 'role_id' => $role->id]
                );
            }
            $applicants[] = $applicant;
        }
        $users['applicants'] = $applicants;

        return $users;
    }

    protected function createProfessions(): array
    {
        $professions = [];

        // Engineer
        $engineer = Profession::create([
            'name' => 'Professional Engineer',
            'code' => 'PE',
            'description' => 'Licensed professional engineer',
            'requires_exam' => true,
            'license_validity_years' => 5,
            'renewal_grace_period_days' => 30,
            'continuing_education_hours' => 30,
            'is_active' => true,
        ]);

        Specialization::create([
            'profession_id' => $engineer->id,
            'name' => 'Civil Engineering',
            'code' => 'CE',
            'description' => 'Civil engineering specialization',
            'is_active' => true,
        ]);

        Specialization::create([
            'profession_id' => $engineer->id,
            'name' => 'Electrical Engineering',
            'code' => 'EE',
            'description' => 'Electrical engineering specialization',
            'is_active' => true,
        ]);

        $professions['engineer'] = $engineer;

        // Medical Doctor
        $doctor = Profession::create([
            'name' => 'Medical Doctor',
            'code' => 'MD',
            'description' => 'Licensed medical practitioner',
            'requires_exam' => true,
            'license_validity_years' => 3,
            'renewal_grace_period_days' => 30,
            'continuing_education_hours' => 50,
            'is_active' => true,
        ]);

        Specialization::create([
            'profession_id' => $doctor->id,
            'name' => 'General Practice',
            'code' => 'GP',
            'description' => 'General medical practice',
            'is_active' => true,
        ]);

        $professions['doctor'] = $doctor;

        // Accountant
        $accountant = Profession::create([
            'name' => 'Certified Public Accountant',
            'code' => 'CPA',
            'description' => 'Licensed accountant',
            'requires_exam' => true,
            'license_validity_years' => 5,
            'renewal_grace_period_days' => 30,
            'continuing_education_hours' => 40,
            'is_active' => true,
        ]);

        $professions['accountant'] = $accountant;

        return $professions;
    }

    protected function createExaminations(array $professions): array
    {
        $examinations = [];

        // Engineer Exam
        $engineerExam = Examination::create([
            'exam_code' => 'PE-2024-001',
            'profession_id' => $professions['engineer']->id,
            'exam_title' => 'Professional Engineer Certification Exam 2024',
            'description' => 'Comprehensive engineering principles and ethics examination',
            'duration_minutes' => 240,
            'total_marks' => 200,
            'passing_marks' => 140,
            'exam_date' => now()->addDays(30),
            'start_time' => '09:00:00',
            'exam_center' => 'Addis Ababa Testing Center',
            'exam_location' => 'Main Hall, Bole Road',
            'max_candidates' => 50,
            'is_active' => true,
        ]);

        $examinations['engineer'] = $engineerExam;

        // Medical Exam
        $doctorExam = Examination::create([
            'exam_code' => 'MD-2024-001',
            'profession_id' => $professions['doctor']->id,
            'exam_title' => 'Medical License Examination 2024',
            'description' => 'Comprehensive medical knowledge and practice examination',
            'duration_minutes' => 360,
            'total_marks' => 300,
            'passing_marks' => 210,
            'exam_date' => now()->addDays(45),
            'start_time' => '08:00:00',
            'exam_center' => 'Medical Council Testing Center',
            'exam_location' => 'Conference Hall, Piazza',
            'max_candidates' => 30,
            'is_active' => true,
        ]);

        $examinations['doctor'] = $doctorExam;

        return $examinations;
    }

    protected function createApplications(array $users, array $professions): array
    {
        $applications = [];
        $applicants = $users['applicants'];

        // Approved Application (ready for license)
        $app1 = LicenseApplication::create([
            'application_number' => 'APP-2024-' . strtoupper(Str::random(6)),
            'applicant_id' => $applicants[0]->id,
            'profession_id' => $professions['engineer']->id,
            'full_name' => $applicants[0]->name,
            'date_of_birth' => '1990-05-15',
            'gender' => 'Male',
            'national_id' => 'NA-' . rand(100000, 999999),
            'email' => $applicants[0]->email,
            'phone' => '+251911' . rand(100000, 999999),
            'address' => 'Bole, Addis Ababa',
            'city' => 'Addis Ababa',
            'region' => 'Addis Ababa',
            'country' => 'Ethiopia',
            'qualification_level' => "Bachelor's Degree",
            'educational_institution' => 'Addis Ababa University',
            'graduation_year' => 2015,
            'experience_years' => 8,
            'status' => ApplicationStatus::APPROVED,
            'submitted_at' => now()->subDays(20),
            'approved_at' => now()->subDays(5),
            'reviewed_by' => $users['licensing_authority']->id,
        ]);
        $this->addApplicationDocuments($app1, $users);
        $applications[] = $app1;

        // Under Review Application
        $app2 = LicenseApplication::create([
            'application_number' => 'APP-2024-' . strtoupper(Str::random(6)),
            'applicant_id' => $applicants[1]->id,
            'profession_id' => $professions['doctor']->id,
            'full_name' => $applicants[1]->name,
            'date_of_birth' => '1988-03-22',
            'gender' => 'Female',
            'national_id' => 'NA-' . rand(100000, 999999),
            'email' => $applicants[1]->email,
            'phone' => '+251911' . rand(100000, 999999),
            'address' => 'Kazanchis, Addis Ababa',
            'city' => 'Addis Ababa',
            'region' => 'Addis Ababa',
            'country' => 'Ethiopia',
            'qualification_level' => "Doctor of Medicine",
            'educational_institution' => 'Addis Ababa University Medical School',
            'graduation_year' => 2013,
            'experience_years' => 10,
            'status' => ApplicationStatus::UNDER_REVIEW,
            'submitted_at' => now()->subDays(10),
            'reviewed_by' => $users['licensing_authority']->id,
        ]);
        $this->addApplicationDocuments($app2, $users);
        $applications[] = $app2;

        // Submitted Application
        $app3 = LicenseApplication::create([
            'application_number' => 'APP-2024-' . strtoupper(Str::random(6)),
            'applicant_id' => $applicants[2]->id,
            'profession_id' => $professions['accountant']->id,
            'full_name' => $applicants[2]->name,
            'date_of_birth' => '1992-08-10',
            'gender' => 'Male',
            'national_id' => 'NA-' . rand(100000, 999999),
            'email' => $applicants[2]->email,
            'phone' => '+251911' . rand(100000, 999999),
            'address' => 'CMC, Addis Ababa',
            'city' => 'Addis Ababa',
            'region' => 'Addis Ababa',
            'country' => 'Ethiopia',
            'qualification_level' => "Bachelor's in Accounting",
            'educational_institution' => 'Unity University',
            'graduation_year' => 2016,
            'experience_years' => 7,
            'status' => ApplicationStatus::SUBMITTED,
            'submitted_at' => now()->subDays(3),
        ]);
        $this->addApplicationDocuments($app3, $users);
        $applications[] = $app3;

        // Draft Application
        $app4 = LicenseApplication::create([
            'application_number' => 'APP-2024-' . strtoupper(Str::random(6)),
            'applicant_id' => $applicants[3]->id,
            'profession_id' => $professions['engineer']->id,
            'full_name' => $applicants[3]->name,
            'date_of_birth' => '1994-11-30',
            'gender' => 'Female',
            'national_id' => 'NA-' . rand(100000, 999999),
            'email' => $applicants[3]->email,
            'phone' => '+251911' . rand(100000, 999999),
            'address' => 'Megenagna, Addis Ababa',
            'city' => 'Addis Ababa',
            'region' => 'Addis Ababa',
            'country' => 'Ethiopia',
            'qualification_level' => "Bachelor's Degree",
            'educational_institution' => 'Bahir Dar University',
            'graduation_year' => 2018,
            'experience_years' => 5,
            'status' => ApplicationStatus::DRAFT,
        ]);
        $applications[] = $app4;

        return $applications;
    }

    protected function addApplicationDocuments($application, $users): void
    {
        // Identity Document
        ProfessionalDocument::create([
            'application_id' => $application->id,
            'document_type' => 'identity',
            'document_name' => 'National ID',
            'file_path' => 'documents/national_id_' . $application->id . '.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 1024000,
            'is_verified' => $application->status === ApplicationStatus::APPROVED,
            'verified_by' => $application->status === ApplicationStatus::APPROVED ? $users['verification_officer']->id : null,
            'verified_at' => $application->status === ApplicationStatus::APPROVED ? now() : null,
        ]);

        // Degree Certificate
        ProfessionalDocument::create([
            'application_id' => $application->id,
            'document_type' => 'degree',
            'document_name' => 'Degree Certificate',
            'file_path' => 'documents/degree_' . $application->id . '.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 2048000,
            'issuing_authority' => $application->educational_institution,
            'issue_date' => $application->graduation_year . '-07-01',
            'is_verified' => $application->status === ApplicationStatus::APPROVED,
            'verified_by' => $application->status === ApplicationStatus::APPROVED ? $users['verification_officer']->id : null,
            'verified_at' => $application->status === ApplicationStatus::APPROVED ? now() : null,
        ]);

        // Educational Record
        EducationalRecord::create([
            'application_id' => $application->id,
            'degree_type' => 'bachelor',
            'field_of_study' => $application->profession->name,
            'institution_name' => $application->educational_institution,
            'country' => 'Ethiopia',
            'graduation_year' => $application->graduation_year,
            'grade_gpa' => '3.5',
        ]);

        // Experience Record
        if ($application->experience_years > 0) {
            ExperienceRecord::create([
                'application_id' => $application->id,
                'organization_name' => 'Previous Employer Ltd',
                'position' => 'Junior ' . $application->profession->name,
                'location' => 'Addis Ababa',
                'start_date' => now()->subYears($application->experience_years),
                'end_date' => now()->subYears(2),
                'is_current' => false,
                'responsibilities' => 'Professional duties and responsibilities',
            ]);
        }

        // Verification Requests
        if (in_array($application->status, [ApplicationStatus::UNDER_REVIEW, ApplicationStatus::APPROVED])) {
            foreach ([VerificationType::IDENTITY, VerificationType::EDUCATION, VerificationType::BACKGROUND] as $type) {
                VerificationRequest::create([
                    'application_id' => $application->id,
                    'verification_type' => $type,
                    'status' => $application->status === ApplicationStatus::APPROVED ? VerificationStatus::VERIFIED : VerificationStatus::PENDING,
                    'verifier_id' => $application->status === ApplicationStatus::APPROVED ? $users['verification_officer']->id : null,
                    'requested_at' => $application->submitted_at,
                    'completed_at' => $application->status === ApplicationStatus::APPROVED ? now() : null,
                ]);
            }
        }
    }

    protected function createLicenses(array $applications, array $users): array
    {
        $licenses = [];

        // Create license for approved application
        $approvedApp = $applications[0];
        
        $license = License::create([
            'license_number' => $approvedApp->profession->code . '-2024-' . strtoupper(Str::random(6)),
            'application_id' => $approvedApp->id,
            'professional_id' => $approvedApp->applicant_id,
            'profession_id' => $approvedApp->profession_id,
            'specialization_id' => $approvedApp->specialization_id,
            'issue_date' => now()->subDays(3),
            'expiry_date' => now()->addYears($approvedApp->profession->license_validity_years),
            'status' => LicenseStatus::ACTIVE,
            'qr_code' => Str::uuid()->toString(),
            'certificate_path' => 'licenses/certificates/' . $approvedApp->application_number . '.pdf',
            'issued_by' => $users['licensing_authority']->id,
        ]);

        // Create professional profile
        ProfessionalProfile::create([
            'user_id' => $approvedApp->applicant_id,
            'current_license_id' => $license->id,
            'current_employer' => 'Tech Solutions Ethiopia',
            'employment_type' => 'full_time',
            'practice_location' => 'Bole, Addis Ababa',
            'practice_city' => 'Addis Ababa',
            'practice_region' => 'Addis Ababa',
            'practice_status' => 'active',
            'years_of_practice' => $approvedApp->experience_years,
            'continuing_education_hours' => 0,
            'is_public_searchable' => true,
        ]);

        $licenses[] = $license;

        return $licenses;
    }

    protected function createComplaints(array $users, array $licenses): void
    {
        if (empty($licenses)) {
            return;
        }

        $license = $licenses[0];

        // Create a sample complaint
        Complaint::create([
            'complaint_number' => 'COMP-2024-' . strtoupper(Str::random(6)),
            'professional_id' => $license->professional_id,
            'license_id' => $license->id,
            'complainant_name' => 'Concerned Citizen',
            'complainant_email' => 'citizen@example.com',
            'complainant_phone' => '+251911222333',
            'is_anonymous' => false,
            'violation_type' => ViolationType::MISCONDUCT,
            'severity' => 'medium',
            'description' => 'Alleged professional misconduct in project delivery',
            'incident_date' => now()->subDays(15),
            'incident_location' => 'Project Site, Addis Ababa',
            'status' => ComplaintStatus::RECEIVED,
        ]);
    }

    protected function displayDemoCredentials(array $users): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('DEMO USER CREDENTIALS');
        $this->command->info('========================================');
        $this->command->info('Licensing Authority: licensing@gov.et / password123');
        $this->command->info('Verification Officer: verifier@gov.et / password123');
        $this->command->info('Exam Officer: examiner@gov.et / password123');
        $this->command->info('Disciplinary Officer: disciplinary@gov.et / password123');
        $this->command->info('');
        $this->command->info('Professional Applicants:');
        foreach ($users['applicants'] as $i => $applicant) {
            $num = $i + 1;
            $this->command->info("  Applicant {$num}: applicant{$num}@example.com / password123");
        }
        $this->command->info('========================================');
        $this->command->info('');
    }
}
