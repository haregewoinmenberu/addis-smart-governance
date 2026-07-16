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
use App\Http\Controllers\Api\ServiceFormSubmissionController;
use App\Http\Controllers\Api\InstitutionDocumentController;
use App\Http\Controllers\Api\InstitutionTeamController;

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UnifiedDashboardController;
use App\Http\Controllers\Api\ExecutiveDashboardController;
use App\Http\Controllers\Api\AuditorDashboardController;
use App\Http\Controllers\Api\InstitutionDashboardController;
use App\Http\Controllers\Api\ResearchDashboardController;
use App\Http\Controllers\Api\TechnologyTransferDashboardController;
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
use App\Http\Controllers\Api\LicenseApplicationController;
use App\Http\Controllers\Api\LicensingDashboardController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\ProfessionController;
use App\Http\Controllers\Api\ExaminationController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DisciplinaryCaseController;
use App\Http\Controllers\Api\SmartCityRequestController;

// Authentication Routes (No Auth Required)
Route::post('/auth/login', [AuthController::class, 'login']);

// ====================================================
// SMART CITY REQUEST MANAGEMENT - PUBLIC ENDPOINTS
// ====================================================

// External Request Submission (No Authentication Required)
Route::post('/smart-city-requests/external', [SmartCityRequestController::class, 'storeExternal']);

// Public Request Tracking by Reference Number
Route::get('/smart-city-requests/track', [SmartCityRequestController::class, 'trackByReference']);


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

    // ====================================================
    // UNIFIED DASHBOARD ROUTES - Permission-based Access
    // ====================================================
    
    // Unified Dashboard - Get available dashboards and permissions
    Route::prefix('dashboards')->group(function () {
        Route::get('/available', [UnifiedDashboardController::class, 'getAvailableDashboards']);
        Route::get('/primary', [UnifiedDashboardController::class, 'getPrimaryDashboard']);
        Route::get('/permissions', [UnifiedDashboardController::class, 'getPermissions']);
        
        // Debug endpoint - Shows what user can access (remove in production)
        Route::get('/debug', function(Request $request) {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }
            
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name'),
                ],
                'all_permissions' => $user->getAllPermissions(),
                'dashboard_permissions' => array_filter($user->getAllPermissions(), function($p) {
                    return strpos($p, 'dashboard') !== false;
                }),
                'can_access' => [
                    'main_dashboard' => $user->hasPermission('view_dashboard'),
                    'executive' => $user->hasPermission('view_executive_dashboard'),
                    'auditor' => $user->hasPermission('view_auditor_dashboard'),
                    'institution' => $user->hasPermission('view_institution_dashboard'),
                    'research' => $user->hasPermission('view_research_dashboard'),
                    'licensing' => $user->hasPermission('view_licensing_dashboard'),
                    'technology_transfer' => $user->hasPermission('view_technology_transfer_dashboard'),
                ],
                'recommended_routes' => array_filter([
                    $user->hasPermission('view_dashboard') ? '/api/dashboard' : null,
                    $user->hasPermission('view_executive_dashboard') ? '/api/dashboards/executive' : null,
                    $user->hasPermission('view_auditor_dashboard') ? '/api/dashboards/auditor' : null,
                    $user->hasPermission('view_institution_dashboard') ? '/api/dashboards/institution' : null,
                    $user->hasPermission('view_research_dashboard') ? '/api/dashboards/research' : null,
                    $user->hasPermission('view_licensing_dashboard') ? '/api/dashboards/licensing' : null,
                    $user->hasPermission('view_technology_transfer_dashboard') ? '/api/dashboards/technology-transfer' : null,
                ]),
            ]);
        });
        
        // Individual Dashboard Endpoints
        Route::get('/executive', [ExecutiveDashboardController::class, 'index'])
            ->middleware('permission:view_executive_dashboard');
        
        Route::get('/auditor', [AuditorDashboardController::class, 'index'])
            ->middleware('permission:view_auditor_dashboard');
        
        Route::get('/institution', [InstitutionDashboardController::class, 'index'])
            ->middleware('permission:view_institution_dashboard');
        
        Route::get('/research', [ResearchDashboardController::class, 'index'])
            ->middleware('permission:view_research_dashboard');
        
        Route::get('/licensing', [LicensingDashboardController::class, 'index'])
            ->middleware('permission:view_licensing_dashboard');
        
        Route::get('/technology-transfer', [TechnologyTransferDashboardController::class, 'index'])
            ->middleware('permission:view_technology_transfer_dashboard');
        
        Route::get('/main', [DashboardController::class, 'index'])
            ->middleware('permission:view_dashboard');
    });
    
    // Legacy Dashboard Routes (Backward Compatibility)
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view_dashboard');
    Route::get('licensing/dashboard', [LicensingDashboardController::class, 'index'])
        ->middleware('permission:view_licensing_dashboard');
    Route::get('technology-transfer/dashboard', [TechnologyTransferDashboardController::class, 'index'])
        ->middleware('permission:view_technology_transfer_dashboard');
    
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
        Route::get('/', [ServiceFormSubmissionController::class, 'index']);
        Route::get('/my-submissions', [ServiceFormSubmissionController::class, 'listUserSubmissions']);
        Route::post('/', [ServiceFormSubmissionController::class, 'store']);
        Route::post('/track', [ServiceFormSubmissionController::class, 'trackByReference']);
        Route::post('/{id}/assign', [ServiceFormSubmissionController::class, 'assign']);
        Route::post('/{id}/review', [ServiceFormSubmissionController::class, 'review']);
        Route::get('/{id}', [ServiceFormSubmissionController::class, 'show']);
        Route::put('/{id}', [ServiceFormSubmissionController::class, 'update']);
        Route::patch('/{id}', [ServiceFormSubmissionController::class, 'update']);
        Route::delete('/{id}', [ServiceFormSubmissionController::class, 'destroy']);
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
    // SMART CITY REQUEST MANAGEMENT - AUTHENTICATED ENDPOINTS
    // ====================================================
    Route::prefix('smart-city-requests')->group(function () {
        // List and View
        Route::get('/', [SmartCityRequestController::class, 'index'])
            ->middleware('permission:view_requests');
        Route::get('/statistics', [SmartCityRequestController::class, 'statistics'])
            ->middleware('permission:view_dashboard');
        Route::get('/{id}', [SmartCityRequestController::class, 'show'])
            ->middleware('permission:view_requests');
        
        // Create Request (Internal/Institutional Users)
        Route::post('/', [SmartCityRequestController::class, 'store'])
            ->middleware('permission:create_requests');
        
        // Smart City Command Center Operations
        Route::post('/{id}/assign', [SmartCityRequestController::class, 'assign'])
            ->middleware('permission:manage_command_center');
        Route::post('/{id}/classify', [SmartCityRequestController::class, 'classify'])
            ->middleware('permission:classify_requests');
        Route::post('/{id}/route', [SmartCityRequestController::class, 'route'])
            ->middleware('permission:route_requests');
        Route::post('/{id}/update-status', [SmartCityRequestController::class, 'updateStatus'])
            ->middleware('permission:manage_command_center');
        Route::post('/{id}/reject', [SmartCityRequestController::class, 'reject'])
            ->middleware('permission:approve_workflows');
    });
});

// ====================================================
// PROFESSIONAL LICENSING MANAGEMENT ROUTES
// ====================================================
Route::middleware(['auth:api', 'log.activity'])->group(function () {
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
});

// Public License Verification - No authentication required
Route::prefix('public/licenses')->group(function () {
    Route::post('/verify', [LicenseController::class, 'verify']);
    Route::post('/verify-qr', [LicenseController::class, 'verifyQR']);
});


// ====================================================
// RESEARCH & INNOVATION MANAGEMENT ROUTES
// Smart City Governance Hierarchy Implementation
// ====================================================
Route::middleware(['auth:api', 'log.activity'])->group(function () {
    // Research Hierarchy Dashboard - Role-based access
    Route::prefix('research')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\ResearchHierarchyDashboardController::class, 'index'])
            ->middleware('permission:view_research_dashboard');
        Route::get('/workflow', [\App\Http\Controllers\Api\ResearchHierarchyDashboardController::class, 'workflow'])
            ->middleware('permission:view_research_dashboard');
    });

    // Smart City Research Requests - Command Center ↔ Research Director
    Route::prefix('smart-city-research-requests')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'index'])
            ->middleware('permission:view-research-ideas');
        Route::post('/', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'store'])
            ->middleware('permission:create-research-ideas');
        Route::get('/{smartCityResearchRequest}', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'show'])
            ->middleware('permission:view-research-ideas');
        Route::put('/{smartCityResearchRequest}', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'update'])
            ->middleware('permission:edit-research-ideas');
        Route::post('/{smartCityResearchRequest}/assign', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'assign'])
            ->middleware('permission:manage-research-projects');
        Route::post('/{smartCityResearchRequest}/complete', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'complete'])
            ->middleware('permission:manage-research-projects');
        Route::get('/{smartCityResearchRequest}/communications', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'communications'])
            ->middleware('permission:view-research-ideas');
        Route::post('/{smartCityResearchRequest}/send-communication', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'sendCommunication'])
            ->middleware('permission:view-research-ideas');
    });

    // Research Ideas
    Route::prefix('research-ideas')->group(function () {
        Route::get('/', [ResearchIdeaController::class, 'index'])
            ->middleware('permission:view-research-ideas');
        Route::post('/', [ResearchIdeaController::class, 'store'])
            ->middleware('permission:create-research-ideas');
        Route::get('/{researchIdea}', [ResearchIdeaController::class, 'show'])
            ->middleware('permission:view-research-ideas');
        Route::put('/{researchIdea}', [ResearchIdeaController::class, 'update'])
            ->middleware('permission:edit-research-ideas');
        Route::delete('/{researchIdea}', [ResearchIdeaController::class, 'destroy'])
            ->middleware('permission:delete-research-ideas');
        Route::post('/{researchIdea}/submit', [ResearchIdeaController::class, 'submit'])
            ->middleware('permission:submit-research-ideas');
    });

    // Research Screening - Review Committee
    Route::prefix('research-screenings')->group(function () {
        Route::get('/', [ResearchScreeningController::class, 'index'])
            ->middleware('permission:view-research-screenings');
        Route::post('/', [ResearchScreeningController::class, 'store'])
            ->middleware('permission:create-research-screenings');
        Route::get('/{researchScreening}', [ResearchScreeningController::class, 'show'])
            ->middleware('permission:view-research-screenings');
        Route::put('/{researchScreening}', [ResearchScreeningController::class, 'update'])
            ->middleware('permission:edit-research-screenings');
        Route::post('/{researchScreening}/approve', [ResearchScreeningController::class, 'approve'])
            ->middleware('permission:approve-research-screenings');
    });

    // Research Projects - Research Director & Lead
    Route::prefix('research-projects')->group(function () {
        Route::get('/', [ResearchProjectController::class, 'index'])
            ->middleware('permission:view-research-projects');
        Route::post('/', [ResearchProjectController::class, 'store'])
            ->middleware('permission:create-research-projects');
        Route::get('/{researchProject}', [ResearchProjectController::class, 'show'])
            ->middleware('permission:view-research-projects');
        Route::put('/{researchProject}', [ResearchProjectController::class, 'update'])
            ->middleware('permission:edit-research-projects');
        Route::delete('/{researchProject}', [ResearchProjectController::class, 'destroy'])
            ->middleware('permission:delete-research-projects');
        Route::post('/{researchProject}/transition', [ResearchProjectController::class, 'transitionStage'])
            ->middleware('permission:transition-research-stages');
        Route::post('/{researchProject}/rollback', [ResearchProjectController::class, 'rollback'])
            ->middleware('permission:rollback-research-stages');
        Route::get('/{researchProject}/transitions', [ResearchProjectController::class, 'availableTransitions'])
            ->middleware('permission:view-research-projects');
    });

    // Research Milestones - Research Lead
    Route::prefix('research-milestones')->group(function () {
        Route::get('/', [ResearchMilestoneController::class, 'index'])
            ->middleware('permission:view-research-projects');
        Route::post('/', [ResearchMilestoneController::class, 'store'])
            ->middleware('permission:manage-milestones');
        Route::get('/{milestone}', [ResearchMilestoneController::class, 'show'])
            ->middleware('permission:view-research-projects');
        Route::put('/{milestone}', [ResearchMilestoneController::class, 'update'])
            ->middleware('permission:manage-milestones');
        Route::delete('/{milestone}', [ResearchMilestoneController::class, 'destroy'])
            ->middleware('permission:manage-milestones');
    });

    // Research Tasks - Research Lead → Researcher
    Route::prefix('research-tasks')->group(function () {
        Route::get('/', [ResearchTaskController::class, 'index'])
            ->middleware('permission:view-research-projects');
        Route::post('/', [ResearchTaskController::class, 'store'])
            ->middleware('permission:manage-tasks');
        Route::get('/{task}', [ResearchTaskController::class, 'show'])
            ->middleware('permission:view-research-projects');
        Route::put('/{task}', [ResearchTaskController::class, 'update'])
            ->middleware('permission:manage-tasks');
        Route::delete('/{task}', [ResearchTaskController::class, 'destroy'])
            ->middleware('permission:manage-tasks');
    });

    // Research Team Management - Research Lead
    Route::prefix('research-teams')->group(function () {
        Route::get('/project/{projectId}', [ResearchTeamController::class, 'index'])
            ->middleware('permission:view-research-projects');
        Route::post('/project/{projectId}/members', [ResearchTeamController::class, 'store'])
            ->middleware('permission:manage-research-projects');
        Route::delete('/members/{memberId}', [ResearchTeamController::class, 'destroy'])
            ->middleware('permission:manage-research-projects');
    });

    // Proposal Reviews - Review Committee
    Route::prefix('proposal-reviews')->group(function () {
        Route::get('/', [ProposalReviewController::class, 'index'])
            ->middleware('permission:view-proposals');
        Route::post('/', [ProposalReviewController::class, 'store'])
            ->middleware('permission:review-proposals');
        Route::get('/{review}', [ProposalReviewController::class, 'show'])
            ->middleware('permission:view-proposals');
        Route::put('/{review}', [ProposalReviewController::class, 'update'])
            ->middleware('permission:review-proposals');
    });

    // Research Evaluations - Review Committee
    Route::prefix('research-evaluations')->group(function () {
        Route::get('/', [ResearchEvaluationController::class, 'index'])
            ->middleware('permission:view-research-projects');
        Route::post('/', [ResearchEvaluationController::class, 'store'])
            ->middleware('permission:evaluate-research');
        Route::get('/{evaluation}', [ResearchEvaluationController::class, 'show'])
            ->middleware('permission:view-research-projects');
        Route::put('/{evaluation}', [ResearchEvaluationController::class, 'update'])
            ->middleware('permission:evaluate-research');
    });

    // Technology Transfer - Research Director → Smart City
    Route::prefix('technology-transfers')->group(function () {
        Route::get('/', [TechnologyTransferController::class, 'index'])
            ->middleware('permission:view-research-projects');
        Route::post('/', [TechnologyTransferController::class, 'store'])
            ->middleware('permission:manage-technology-transfer');
        Route::get('/{transfer}', [TechnologyTransferController::class, 'show'])
            ->middleware('permission:view-research-projects');
        Route::put('/{transfer}', [TechnologyTransferController::class, 'update'])
            ->middleware('permission:manage-technology-transfer');
        Route::post('/{transfer}/approve', [TechnologyTransferController::class, 'approve'])
            ->middleware('permission:approve-technology-transfer');
    });
});


// ====================================================
// SMART CITY COMMAND CENTER - SERVICE MANAGEMENT
// ====================================================
Route::middleware(['auth:api', 'log.activity'])->prefix('smart-city')->group(function () {
    // Service Request Management - Smart City Command Center Only
    Route::get('/services', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'index']);
    Route::get('/services/analytics', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'analytics']);
    Route::get('/services/export', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'export']);
    Route::get('/services/{id}', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'show']);
    Route::put('/services/{id}/status', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'updateStatus']);
    Route::post('/services/{id}/assign', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'assign']);
    Route::post('/services/{id}/notes', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'addNotes']);
    Route::post('/services/bulk-update-status', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'bulkUpdateStatus']);
    Route::delete('/services/{id}', [\App\Http\Controllers\Api\SmartCityServiceManagementController::class, 'destroy']);
});


// ====================================================
// SMART CITY COMMAND CENTER - RESEARCH IDEAS MANAGEMENT
// All research requests flow through Smart City Command Center first
// ====================================================
Route::middleware(['auth:api', 'log.activity'])->prefix('smart-city/research')->group(function () {
    // Research Ideas Management for Smart City Command Center
    Route::get('/ideas', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'index']);
    Route::get('/ideas/analytics', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'analytics']);
    Route::get('/ideas/{id}', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'show']);
    Route::post('/ideas/{id}/assign-to-director', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'assignToDirector']);
    Route::put('/ideas/{id}/status', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'updateStatus']);
    Route::post('/ideas/{id}/notes', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'addNotes']);
    Route::post('/ideas/{id}/reject', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'reject']);
    Route::post('/ideas/bulk-assign', [\App\Http\Controllers\Api\SmartCityResearchController::class, 'bulkAssign']);
});

// ====================================================
// SMART CITY COMMAND CENTER - SERVICE REQUESTS MANAGEMENT
// All service form submissions visible to Smart City Command Center
// ====================================================
Route::middleware(['auth:api', 'log.activity'])->prefix('smart-city/service-requests')->group(function () {
    // Service Requests Management for Smart City Command Center
    Route::get('/', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'index']);
    Route::get('/analytics', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'analytics']);
    Route::get('/{id}', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'show']);
    Route::post('/{id}/assign', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'assign']);
    Route::put('/{id}/status', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'updateStatus']);
    Route::post('/{id}/notes', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'addNotes']);
    Route::post('/{id}/approve', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'approve']);
    Route::post('/{id}/reject', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'reject']);
    Route::post('/bulk-assign', [\App\Http\Controllers\Api\SmartCityServiceRequestController::class, 'bulkAssign']);
});


Route::get('/with-roles-permissions', [AuditController::class, 'getAllUserWithRoleAndPermission']);
