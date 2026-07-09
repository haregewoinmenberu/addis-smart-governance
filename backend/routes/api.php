<?php
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\CybersecurityIssueController; 
use App\Http\Controllers\Api\DuplicationCaseController;
use App\Http\Controllers\Api\FeasibilityStudyController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\ModuleController; 
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RequestItemController;
use App\Http\Controllers\Api\SurveyController;
use App\Http\Controllers\Api\TechnologyController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\WorkflowController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SubCityController;
use App\Http\Controllers\Api\ServiceFormSubmissionController;
use App\Http\Controllers\Api\InstitutionDocumentController;
use App\Http\Controllers\Api\InstitutionTeamController;

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ResearchIdeaController;
use App\Http\Controllers\Api\ResearchScreeningController;
use App\Http\Controllers\Api\ResearchProjectController;
use App\Http\Controllers\Api\ResearchEvaluationController;
use App\Http\Controllers\Api\TechnologyTransferController;
use App\Http\Controllers\Api\ResearchMilestoneController;
use App\Http\Controllers\Api\ResearchTaskController;
use App\Http\Controllers\Api\ResearchTeamController;
use App\Http\Controllers\Api\ProposalReviewController;
use App\Http\Controllers\Api\TechnologyRequestController;
use App\Http\Controllers\Api\TechnologyEvaluationController;
use App\Http\Controllers\Api\TechnologyRegistryController;
use App\Http\Controllers\Api\TechnologyIncidentController;
use App\Http\Controllers\Api\LicenseApplicationController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\ProfessionController;
use App\Http\Controllers\Api\ExaminationController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DisciplinaryCaseController;

// Authentication Routes (No Auth Required)
Route::post('/auth/login', [AuthController::class, 'login']);


// Institution Registration - Public endpoint
Route::prefix('institutions')->group(function () {
    Route::post('/register', [InstitutionController::class, 'register']);
    Route::get('/types', [InstitutionController::class, 'types']);
    Route::get('/debug', function(Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Institution routes are working',
            'request_data' => $request->all(),
            'headers' => $request->headers->all(),
        ]);
    });
});

// Service Form Submission - Public endpoint (can be called without auth)
Route::prefix('service-forms')->group(function () {
    Route::post('/submit', [ServiceFormSubmissionController::class, 'submitForm']);
    Route::get('/status/{referenceNumber}', [ServiceFormSubmissionController::class, 'getSubmissionStatus']);
});

Route::get('health', function () {
    return response()->json(['status' => 'ok']);
});

// Protected routes
Route::middleware(['auth:api', 'log.activity'])->group(function () {
        
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('profile/update', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::get('activity-logs', [AuthController::class, 'activityLogs']);
        Route::get('sessions', [AuthController::class, 'sessions']);
        Route::post('sessions/{id}/revoke', [AuthController::class, 'revokeSession']);
        Route::post('sessions/revoke-all', [AuthController::class, 'revokeAllOtherSessions']);
    });

    // Dashboard - All authenticated users
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view_dashboard');
    // Modules - All authenticated users
    Route::get('modules/{key}', [ModuleController::class, 'show']);

    // Settings - View for all, manage for ITDB Admin only
    Route::get('settings', [SettingsController::class, 'show'])
        ->middleware('permission:view_settings');
    Route::post('settings/update', [SettingsController::class, 'update'])
        ->middleware('permission:manage_settings');
    Route::get('settings/{key}', [SettingsController::class, 'getSetting'])
        ->middleware('permission:view_settings');
    Route::post('settings/{key}/update', [SettingsController::class, 'updateSetting'])
        ->middleware('permission:manage_settings');
    Route::post('settings/clear-cache', [SettingsController::class, 'clearCache'])
        ->middleware('permission:manage_settings');

    // Roles & Permissions - ITDB Administrator only
    Route::middleware('role:itdb_administrator')->group(function () {
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('roles/{role}', [RoleController::class, 'show']);
        Route::post('roles/{role}/permissions/update', [RoleController::class, 'updatePermissions']);
        Route::get('permissions', [RoleController::class, 'permissions']);
    });

    // Sub-Cities Management - ITDB Administrator can manage all
    Route::prefix('sub-cities')->group(function () {
        Route::get('/', [SubCityController::class, 'index'])
            ->middleware('permission:view_sub_cities');
        Route::post('/', [SubCityController::class, 'store'])
            ->middleware('permission:create_sub_cities');
        Route::get('/{id}', [SubCityController::class, 'show'])
            ->middleware('permission:view_sub_cities');
        Route::post('/{id}/update', [SubCityController::class, 'update'])
            ->middleware('permission:edit_sub_cities');
        Route::post('/{id}/delete', [SubCityController::class, 'destroy'])
            ->middleware('permission:delete_sub_cities');
        Route::post('/{id}/activate', [SubCityController::class, 'activate'])
            ->middleware('permission:edit_sub_cities');
        Route::post('/{id}/deactivate', [SubCityController::class, 'deactivate'])
            ->middleware('permission:edit_sub_cities');
        Route::get('/{id}/statistics', [SubCityController::class, 'statistics'])
            ->middleware('permission:view_sub_cities');
        Route::get('/{id}/users', [SubCityController::class, 'users'])
            ->middleware('permission:view_sub_cities');
        Route::post('/{id}/administrator/update', [SubCityController::class, 'updateAdministrator'])
            ->middleware('permission:edit_sub_cities');
    });

    // Users - ITDB Administrator can manage all, others can view
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])
            ->middleware('permission:view_users');
        Route::post('/', [UserController::class, 'store'])
            ->middleware('permission:create_users');
        Route::get('/{id}', [UserController::class, 'show'])
            ->middleware('permission:view_users');
        Route::post('/{id}/update', [UserController::class, 'update'])
            ->middleware('permission:edit_users');
        Route::post('/{id}/delete', [UserController::class, 'destroy'])
            ->middleware('permission:delete_users');
        Route::post('/{id}/toggle-active', [UserController::class, 'toggleActive'])
            ->middleware('permission:edit_users');
        Route::post('/{id}/reset-password', [UserController::class, 'resetPassword'])
            ->middleware('permission:edit_users');
        Route::get('/{id}/activity', [UserController::class, 'activityLogs'])
            ->middleware('permission:view_users');
    });

    // Technology Requests
    Route::prefix('requests')->group(function () {
        Route::get('/', [RequestItemController::class, 'index'])
            ->middleware('permission:view_requests');
        Route::post('/', [RequestItemController::class, 'store'])
            ->middleware('permission:create_requests');
        Route::get('/statistics', [RequestItemController::class, 'statistics'])
            ->middleware('permission:view_requests');
        Route::get('/{id}', [RequestItemController::class, 'show'])
            ->middleware('permission:view_requests');
        Route::post('/{id}/update', [RequestItemController::class, 'update'])
            ->middleware('permission:edit_requests');
        Route::post('/{id}/delete', [RequestItemController::class, 'destroy'])
            ->middleware('permission:delete_requests');
        Route::post('/{id}/submit', [RequestItemController::class, 'submit'])
            ->middleware('permission:submit_requests');
        Route::post('/{id}/resubmit', [RequestItemController::class, 'resubmit'])
            ->middleware('permission:submit_requests');
    });

    // Technology Registry
    Route::prefix('technologies')->group(function () {
        Route::get('/', [TechnologyController::class, 'index'])
            ->middleware('permission:view_technologies');
        Route::post('/', [TechnologyController::class, 'store'])
            ->middleware('permission:create_technologies');
        Route::get('/statistics', [TechnologyController::class, 'statistics'])
            ->middleware('permission:view_technologies');
        Route::get('/{id}', [TechnologyController::class, 'show'])
            ->middleware('permission:view_technologies');
        Route::post('/{id}/update', [TechnologyController::class, 'update'])
            ->middleware('permission:edit_technologies');
        Route::post('/{id}/delete', [TechnologyController::class, 'destroy'])
            ->middleware('permission:delete_technologies');
    });

    // Workflows
    Route::prefix('workflows')->group(function () {
        Route::get('/', [WorkflowController::class, 'index'])
            ->middleware('permission:view_workflows');
        Route::post('/', [WorkflowController::class, 'store'])
            ->middleware('permission:create_workflows');
        Route::get('/analytics', [WorkflowController::class, 'analytics'])
            ->middleware('permission:view_workflows');
        Route::get('/instances', [WorkflowController::class, 'instances'])
            ->middleware('permission:view_workflows');
        Route::get('/instances/my-approvals', [WorkflowController::class, 'myApprovals'])
            ->middleware('permission:approve_workflows');
        Route::get('/instances/{id}', [WorkflowController::class, 'showInstance'])
            ->middleware('permission:view_workflows');
        Route::post('/instances/{id}/approve', [WorkflowController::class, 'approve'])
            ->middleware('permission:approve_workflows');
        Route::post('/instances/{id}/reject', [WorkflowController::class, 'reject'])
            ->middleware('permission:approve_workflows');
        Route::post('/instances/{id}/request-revision', [WorkflowController::class, 'requestRevision'])
            ->middleware('permission:approve_workflows');
        Route::post('/instances/{id}/cancel', [WorkflowController::class, 'cancel'])
            ->middleware('permission:cancel_workflows');
        Route::get('/{id}', [WorkflowController::class, 'show'])
            ->middleware('permission:view_workflows');
        Route::post('/{id}/update', [WorkflowController::class, 'update'])
            ->middleware('permission:edit_workflows');
        Route::post('/{id}/delete', [WorkflowController::class, 'destroy'])
            ->middleware('permission:delete_workflows');
    });

    // Audits - Auditors and ITDB Admin
    Route::prefix('audits')->group(function () {
        Route::get('/', [AuditController::class, 'index'])
            ->middleware('permission:view_audits');
        Route::post('/', [AuditController::class, 'store'])
            ->middleware('permission:create_audits');
        Route::get('/{id}', [AuditController::class, 'show'])
            ->middleware('permission:view_audits');
        Route::post('/{id}/update', [AuditController::class, 'update'])
            ->middleware('permission:conduct_audits');
        Route::post('/{id}/delete', [AuditController::class, 'destroy'])
            ->middleware('permission:create_audits');
    });

    // Vendors
    Route::prefix('vendors')->group(function () {
        Route::get('/', [VendorController::class, 'index'])
            ->middleware('permission:view_vendors');
        Route::post('/', [VendorController::class, 'store'])
            ->middleware('permission:create_vendors');
        Route::get('/{id}', [VendorController::class, 'show'])
            ->middleware('permission:view_vendors');
        Route::post('/{id}/update', [VendorController::class, 'update'])
            ->middleware('permission:edit_vendors');
        Route::post('/{id}/delete', [VendorController::class, 'destroy'])
            ->middleware('permission:edit_vendors');
        Route::post('/{id}/approve', [VendorController::class, 'approve'])
            ->middleware('permission:approve_vendors');
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])
            ->middleware('permission:view_reports');
        Route::post('/', [ReportController::class, 'store'])
            ->middleware('permission:create_reports');
        Route::get('/{id}', [ReportController::class, 'show'])
            ->middleware('permission:view_reports');
        Route::get('/{id}/export', [ReportController::class, 'export'])
            ->middleware('permission:export_reports');
    });

    // Cybersecurity
    Route::prefix('cybersecurity')->group(function () {
        Route::get('/', [CybersecurityIssueController::class, 'index'])
            ->middleware('permission:view_cybersecurity');
        Route::post('/', [CybersecurityIssueController::class, 'store'])
            ->middleware('permission:manage_cybersecurity');
        Route::get('/{id}', [CybersecurityIssueController::class, 'show'])
            ->middleware('permission:view_cybersecurity');
        Route::post('/{id}/update', [CybersecurityIssueController::class, 'update'])
            ->middleware('permission:manage_cybersecurity');
    });

    // Duplication Analysis
    Route::prefix('duplications')->group(function () {
        Route::get('/', [DuplicationCaseController::class, 'index'])
            ->middleware('permission:view_duplication');
        Route::get('/statistics', [DuplicationCaseController::class, 'statistics'])
            ->middleware('permission:view_duplication');
        Route::post('/requests/{requestId}/analyze', [DuplicationCaseController::class, 'analyze'])
            ->middleware('permission:perform_duplication_analysis');
        Route::get('/{id}', [DuplicationCaseController::class, 'show'])
            ->middleware('permission:view_duplication');
        Route::post('/{id}/override', [DuplicationCaseController::class, 'override'])
            ->middleware('permission:perform_duplication_analysis');
        Route::post('/{id}/delete', [DuplicationCaseController::class, 'destroy'])
            ->middleware('permission:perform_duplication_analysis');
    });

    // Feasibility Studies
    Route::prefix('feasibility-studies')->group(function () {
        Route::get('/', [FeasibilityStudyController::class, 'index'])
            ->middleware('permission:view_feasibility');
        Route::get('/criteria', [FeasibilityStudyController::class, 'criteria'])
            ->middleware('permission:view_feasibility');
        Route::get('/statistics', [FeasibilityStudyController::class, 'statistics'])
            ->middleware('permission:view_feasibility');
        Route::post('/requests/{requestId}/evaluate', [FeasibilityStudyController::class, 'evaluate'])
            ->middleware('permission:conduct_feasibility');
        Route::get('/{id}', [FeasibilityStudyController::class, 'show'])
            ->middleware('permission:view_feasibility');
        Route::post('/{id}/update', [FeasibilityStudyController::class, 'update'])
            ->middleware('permission:conduct_feasibility');
        Route::post('/{id}/delete', [FeasibilityStudyController::class, 'destroy'])
            ->middleware('permission:conduct_feasibility');
    });

    // Surveys
    Route::prefix('surveys')->group(function () {
        Route::get('/', [SurveyController::class, 'index'])
            ->middleware('permission:view_surveys');
        Route::post('/', [SurveyController::class, 'store'])
            ->middleware('permission:create_surveys');
        Route::get('/{id}', [SurveyController::class, 'show'])
            ->middleware('permission:view_surveys');
        Route::post('/{id}/respond', [SurveyController::class, 'respond'])
            ->middleware('permission:participate_surveys');
    }); 
    // Service Form Submissions - Protected routes
    Route::prefix('service-forms')->group(function () {
        Route::get('/my-submissions', [ServiceFormSubmissionController::class, 'listUserSubmissions']);
    });

    // Institutions - Protected routes
    Route::prefix('institutions')->group(function () {
        // My institution (institutional users)
        Route::get('/my-institution', [InstitutionController::class, 'myInstitution']);
        
        // All institutions (admin)
        Route::get('/', [InstitutionController::class, 'index']);
        Route::get('/statistics', [InstitutionController::class, 'statistics']);
        
        // Single institution
        Route::get('/{id}', [InstitutionController::class, 'show']);
        Route::post('/{id}/update', [InstitutionController::class, 'update']);
        Route::post('/{id}/verify', [InstitutionController::class, 'verify']);
        Route::post('/{id}/change-status', [InstitutionController::class, 'changeStatus']);
        
        // Institution service requests
        Route::get('/{id}/requests', [InstitutionController::class, 'requests']);
        
        // Institution documents
        Route::get('/{id}/documents', [InstitutionDocumentController::class, 'index']);
        Route::post('/{id}/documents', [InstitutionDocumentController::class, 'store']);
        Route::get('/{id}/documents/statistics', [InstitutionDocumentController::class, 'statistics']);
        Route::get('/{id}/documents/{documentId}', [InstitutionDocumentController::class, 'show']);
        Route::get('/{id}/documents/{documentId}/download', [InstitutionDocumentController::class, 'download']);
        Route::post('/{id}/documents/{documentId}/delete', [InstitutionDocumentController::class, 'destroy']);
        
        // Institution team members
        Route::get('/{id}/team', [InstitutionTeamController::class, 'index']);
        Route::post('/{id}/team', [InstitutionTeamController::class, 'store']);
        Route::get('/{id}/team/statistics', [InstitutionTeamController::class, 'statistics']);
        Route::get('/{id}/team/{memberId}', [InstitutionTeamController::class, 'show']);
        Route::post('/{id}/team/{memberId}/update', [InstitutionTeamController::class, 'update']);
        Route::post('/{id}/team/{memberId}/delete', [InstitutionTeamController::class, 'destroy']);
        Route::post('/{id}/team/{memberId}/resend-invitation', [InstitutionTeamController::class, 'resendInvitation']);
    });
    
    // Team invitation acceptance
    Route::post('/team/accept-invitation', [InstitutionTeamController::class, 'acceptInvitation']);
});
 
 // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])
            ->middleware('permission:view_notifications');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])
            ->middleware('permission:view_notifications');
        Route::get('/recent', [NotificationController::class, 'recent'])
            ->middleware('permission:view_notifications');
        Route::get('/statistics', [NotificationController::class, 'statistics'])
            ->middleware('permission:view_notifications');
        Route::get('/{id}', [NotificationController::class, 'show'])
            ->middleware('permission:view_notifications');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])
            ->middleware('permission:view_notifications');
        Route::post('/{id}/unread', [NotificationController::class, 'markAsUnread'])
            ->middleware('permission:view_notifications');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])
            ->middleware('permission:view_notifications');
        Route::post('/{id}/delete', [NotificationController::class, 'destroy'])
            ->middleware('permission:view_notifications');
        Route::post('/read/delete-all', [NotificationController::class, 'deleteAllRead'])
            ->middleware('permission:view_notifications');
        Route::post('/all/clear', [NotificationController::class, 'deleteAll'])
            ->middleware('permission:view_notifications');
    });


    // ====================================================
    // PROFESSIONAL LICENSING MANAGEMENT ROUTES
    // ====================================================

    // Professions & Specializations - Public can view
    Route::prefix('professions')->group(function () {
        Route::get('/', [ProfessionController::class, 'index'])
            ->middleware('permission:view_professions');
        Route::post('/', [ProfessionController::class, 'store'])
            ->middleware('permission:manage_professions');
        Route::get('/{id}', [ProfessionController::class, 'show'])
            ->middleware('permission:view_professions');
        Route::post('/{id}/update', [ProfessionController::class, 'update'])
            ->middleware('permission:manage_professions');
        Route::get('/{id}/specializations', [ProfessionController::class, 'specializations'])
            ->middleware('permission:view_professions');
        Route::post('/{id}/specializations', [ProfessionController::class, 'addSpecialization'])
            ->middleware('permission:manage_specializations');
    });

    // License Applications
    Route::prefix('license-applications')->group(function () {
        Route::get('/', [LicenseApplicationController::class, 'index'])
            ->middleware('permission:view_license_applications');
        Route::post('/', [LicenseApplicationController::class, 'store'])
            ->middleware('permission:create_license_application');
        Route::get('/statistics', [LicenseApplicationController::class, 'statistics'])
            ->middleware('permission:view_license_applications');
        Route::get('/{id}', [LicenseApplicationController::class, 'show'])
            ->middleware('permission:view_license_applications');
        Route::post('/{id}/update', [LicenseApplicationController::class, 'update'])
            ->middleware('permission:update_license_application');
        Route::post('/{id}/submit', [LicenseApplicationController::class, 'submit'])
            ->middleware('permission:submit_license_application');
        Route::post('/{id}/start-review', [LicenseApplicationController::class, 'startReview'])
            ->middleware('permission:review_license_application');
        Route::post('/{id}/approve', [LicenseApplicationController::class, 'approve'])
            ->middleware('permission:approve_license_application');
        Route::post('/{id}/reject', [LicenseApplicationController::class, 'reject'])
            ->middleware('permission:reject_license_application');
        Route::post('/{id}/return-for-correction', [LicenseApplicationController::class, 'returnForCorrection'])
            ->middleware('permission:review_license_application');
        Route::post('/{id}/delete', [LicenseApplicationController::class, 'destroy'])
            ->middleware('permission:delete_license_application');
    });

    // Licenses
    Route::prefix('licenses')->group(function () {
        Route::get('/', [LicenseController::class, 'index'])
            ->middleware('permission:view_licenses');
        Route::post('/issue', [LicenseController::class, 'issue'])
            ->middleware('permission:issue_license');
        Route::post('/verify', [LicenseController::class, 'verify'])
            ->middleware('permission:verify_license');
        Route::post('/verify-qr', [LicenseController::class, 'verifyQR'])
            ->middleware('permission:verify_license');
        Route::get('/statistics', [LicenseController::class, 'statistics'])
            ->middleware('permission:view_licenses');
        Route::get('/{id}', [LicenseController::class, 'show'])
            ->middleware('permission:view_licenses');
        Route::post('/{id}/suspend', [LicenseController::class, 'suspend'])
            ->middleware('permission:suspend_license');
        Route::post('/{id}/reactivate', [LicenseController::class, 'reactivate'])
            ->middleware('permission:reactivate_license');
        Route::post('/{id}/revoke', [LicenseController::class, 'revoke'])
            ->middleware('permission:revoke_license');
        Route::get('/{id}/certificate/download', [LicenseController::class, 'downloadCertificate'])
            ->middleware('permission:download_license_certificate');
    });

    // Examinations
    Route::prefix('examinations')->group(function () {
        Route::get('/', [ExaminationController::class, 'index'])
            ->middleware('permission:view_examinations');
        Route::post('/', [ExaminationController::class, 'store'])
            ->middleware('permission:create_examination');
        Route::get('/{id}', [ExaminationController::class, 'show'])
            ->middleware('permission:view_examinations');
        Route::post('/{id}/register', [ExaminationController::class, 'register'])
            ->middleware('permission:register_for_exam');
        Route::get('/my-attempts', [ExaminationController::class, 'myAttempts'])
            ->middleware('permission:view_examinations');
    });

    // Exam Attempts
    Route::prefix('exam-attempts')->group(function () {
        Route::post('/{id}/start', [ExaminationController::class, 'startExam'])
            ->middleware('permission:register_for_exam');
        Route::post('/{id}/submit', [ExaminationController::class, 'submitExam'])
            ->middleware('permission:register_for_exam');
        Route::post('/{id}/evaluate', [ExaminationController::class, 'evaluate'])
            ->middleware('permission:evaluate_exam');
        Route::post('/{id}/appeal', [ExaminationController::class, 'fileAppeal'])
            ->middleware('permission:file_exam_appeal');
    });

    // Complaints
    Route::prefix('complaints')->group(function () {
        Route::get('/', [ComplaintController::class, 'index'])
            ->middleware('permission:view_complaints');
        Route::post('/', [ComplaintController::class, 'store'])
            ->middleware('permission:file_complaint');
        Route::get('/statistics', [ComplaintController::class, 'statistics'])
            ->middleware('permission:view_complaints');
        Route::get('/{id}', [ComplaintController::class, 'show'])
            ->middleware('permission:view_complaints');
        Route::post('/{id}/assign-investigator', [ComplaintController::class, 'assignInvestigator'])
            ->middleware('permission:assign_complaint_investigator');
        Route::post('/{id}/complete-investigation', [ComplaintController::class, 'completeInvestigation'])
            ->middleware('permission:investigate_complaint');
        Route::post('/{id}/dismiss', [ComplaintController::class, 'dismiss'])
            ->middleware('permission:dismiss_complaint');
    });

    // Disciplinary Cases
    Route::prefix('disciplinary-cases')->group(function () {
        Route::get('/', [DisciplinaryCaseController::class, 'index'])
            ->middleware('permission:view_disciplinary_cases');
        Route::get('/statistics', [DisciplinaryCaseController::class, 'statistics'])
            ->middleware('permission:view_disciplinary_cases');
        Route::get('/{id}', [DisciplinaryCaseController::class, 'show'])
            ->middleware('permission:view_disciplinary_cases');
        Route::post('/{id}/schedule-hearing', [DisciplinaryCaseController::class, 'scheduleHearing'])
            ->middleware('permission:schedule_hearing');
        Route::post('/{id}/impose-action', [DisciplinaryCaseController::class, 'imposeDisciplinaryAction'])
            ->middleware('permission:impose_disciplinary_action');
    });

    // Hearings
    Route::prefix('hearings')->group(function () {
        Route::post('/{id}/record-decision', [DisciplinaryCaseController::class, 'recordHearingDecision'])
            ->middleware('permission:record_hearing_decision');
    }); 
    
// Public License Verification - No authentication required
Route::prefix('public/licenses')->group(function () {
    Route::post('/verify', [LicenseController::class, 'verify']);
    Route::post('/verify-qr', [LicenseController::class, 'verifyQR']);
});
