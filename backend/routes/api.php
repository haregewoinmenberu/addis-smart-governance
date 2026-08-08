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
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Controllers\Api\RBACStatsController;
use App\Http\Controllers\Api\RBACDebugController;
use App\Http\Controllers\Api\RoleBulkController;
use App\Http\Controllers\Api\ServiceFormSubmissionController;
use App\Http\Controllers\Api\InstitutionDocumentController;
use App\Http\Controllers\Api\InstitutionTeamController;
use App\Http\Controllers\Api\SupportTicketController;

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
});

// Service Form Submission - Public endpoint (can be called without auth)
// Add CORS middleware explicitly for public routes
Route::prefix('service-forms')->middleware([\Illuminate\Http\Middleware\HandleCors::class])->group(function () {
    // Handle OPTIONS preflight requests explicitly
    Route::options('/submit', function () {
        return response('', 200);
    });
    
    Route::post('/submit', [ServiceFormSubmissionController::class, 'submitForm']);
    Route::get('/status/{referenceNumber}', [ServiceFormSubmissionController::class, 'getSubmissionStatus']);
 
    
    // Diagnostic endpoint to check system status
    Route::get('/diagnostic', function () {
        try {
            $checks = [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'storage_writable' => is_writable(storage_path()),
                'db_connected' => false,
                'env_loaded' => config('app.key') !== null,
                'app_key_set' => !empty(config('app.key')),
            ];
            
            // Test database connection
            try {
                \DB::connection()->getPdo();
                $checks['db_connected'] = true;
                $checks['db_name'] = \DB::connection()->getDatabaseName();
            } catch (\Exception $e) {
                $checks['db_error'] = $e->getMessage();
            }
            
            return response()->json([
                'success' => true,
                'checks' => $checks,
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    });
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
    Route::middleware('permission:manage_roles')->group(function () {
        // Roles Management
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index']);
            Route::post('/', [RoleController::class, 'store']);
            Route::get('/{id}', [RoleController::class, 'show']);
            Route::put('/{id}', [RoleController::class, 'update']);
            Route::post('/{id}/update', [RoleController::class, 'update']);
            Route::delete('/{id}', [RoleController::class, 'destroy']);
            Route::post('/{id}/permissions', [RoleController::class, 'assignPermissions']);
            Route::get('/{id}/users', [RoleController::class, 'users']);
        });

        // Permissions Management
        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index']);
            Route::post('/', [PermissionController::class, 'store']);
            Route::get('/modules', [PermissionController::class, 'modules']);
            Route::get('/{id}', [PermissionController::class, 'show']);
            Route::put('/{id}', [PermissionController::class, 'update']);
            Route::post('/{id}/update', [PermissionController::class, 'update']);
            Route::delete('/{id}', [PermissionController::class, 'destroy']);
            Route::get('/{id}/roles', [PermissionController::class, 'roles']);
        });

        // RBAC Statistics
        Route::prefix('rbac/stats')->group(function () {
            Route::get('/', [RBACStatsController::class, 'index']);
            Route::get('/permissions', [RBACStatsController::class, 'permissions']);
            Route::get('/roles', [RBACStatsController::class, 'roles']);
            Route::get('/users', [RBACStatsController::class, 'users']);
            Route::post('/clear-cache', [RBACStatsController::class, 'clearCache']);
        });

        // RBAC Debug (remove in production)
        Route::prefix('rbac/debug')->group(function () {
            Route::get('/', [RBACDebugController::class, 'index']);
            Route::get('/check-permission/{permission}', [RBACDebugController::class, 'checkPermission']);
            Route::get('/check-role/{role}', [RBACDebugController::class, 'checkRole']);
        });

        // Bulk Operations
        Route::prefix('rbac/bulk')->group(function () {
            Route::post('/assign-roles', [RoleBulkController::class, 'bulkAssign']);
            Route::post('/remove-roles', [RoleBulkController::class, 'bulkRemove']);
            Route::post('/clone-role/{id}', [RoleBulkController::class, 'cloneRole']);
            Route::post('/delete-roles', [RoleBulkController::class, 'bulkDelete']);
        });
    });

    // Users - ITDB Administrator can manage all, others can view
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])
            ->middleware('permission:view_users');
        Route::get('/manageable-roles', [UserController::class, 'manageableRoles'])
            ->middleware('permission:view_users');
        Route::get('/hierarchy-info', [UserController::class, 'hierarchyInfo'])
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

        // User Role Management
        Route::get('/{id}/roles', [UserRoleController::class, 'index'])
            ->middleware('permission:view_users');
        Route::post('/{id}/roles', [UserRoleController::class, 'assign'])
            ->middleware('permission:manage_roles');
        Route::post('/{id}/roles/add', [UserRoleController::class, 'addRole'])
            ->middleware('permission:manage_roles');
        Route::delete('/{id}/roles/{roleId}', [UserRoleController::class, 'remove'])
            ->middleware('permission:manage_roles');
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
        Route::get('/assignable-users', [ServiceFormSubmissionController::class, 'getAssignableUsers']);
        Route::post('/', [ServiceFormSubmissionController::class, 'store']);
        Route::post('/track', [ServiceFormSubmissionController::class, 'trackByReference']);
        Route::post('/{id}/assign', [ServiceFormSubmissionController::class, 'assign']);
        Route::post('/{id}/review', [ServiceFormSubmissionController::class, 'review']);
        Route::get('/{id}', [ServiceFormSubmissionController::class, 'show']);
        Route::get('/{id}/download-file', [ServiceFormSubmissionController::class, 'downloadFile']);
        Route::put('/{id}', [ServiceFormSubmissionController::class, 'update']);
        Route::patch('/{id}', [ServiceFormSubmissionController::class, 'update']);
        Route::delete('/{id}', [ServiceFormSubmissionController::class, 'destroy']);
    });

    // Service Request Workflow Management
    Route::prefix('service-request-workflow')->group(function () {
        Route::get('/team-leaders', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'getAvailableTeamLeaders']);
        Route::get('/officers', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'getAvailableOfficers']);
        
        Route::prefix('requests/{serviceRequest}')->group(function () {
            Route::get('/assignments', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'getAssignments']);
            Route::post('/assign-team-leader', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'assignTeamLeader']);
            Route::post('/assign-officer', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'assignOfficer']);
        });

        Route::prefix('assignments/{assignment}')->group(function () {
            Route::post('/accept', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'acceptAssignment']);
            Route::post('/start', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'startAssignment']);
            Route::post('/complete', [\App\Http\Controllers\Api\ServiceRequestWorkflowController::class, 'completeAssignment']);
        });
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

    // ====================================================
    // SUPPORT TICKET MANAGEMENT
    // ====================================================
    Route::prefix('support-tickets')->group(function () {
        // List tickets
        Route::get('/', [SupportTicketController::class, 'index']);

        // Create ticket (any authenticated user)
        Route::post('/', [SupportTicketController::class, 'store']);

        // Get statistics
        Route::get('/statistics', [SupportTicketController::class, 'statistics']);

        // View ticket details
        Route::get('/{id}', [SupportTicketController::class, 'show']);

        // Update ticket (support officers)
        Route::put('/{id}', [SupportTicketController::class, 'update'])
            ->middleware('permission:update_ticket');

        // Accept ticket (support officers)
        Route::post('/{id}/accept', [SupportTicketController::class, 'accept'])
            ->middleware('permission:accept_ticket');

        // Resolve ticket (support officers)
        Route::post('/{id}/resolve', [SupportTicketController::class, 'resolve'])
            ->middleware('permission:resolve_ticket');

        // Close ticket (support officers)
        Route::post('/{id}/close', [SupportTicketController::class, 'close'])
            ->middleware('permission:close_ticket');

        // Add message to ticket
        Route::post('/{id}/messages', [SupportTicketController::class, 'addMessage']);
    });

    Route::get('/with-roles-permissions', [AuditController::class, 'getAllUserWithRoleAndPermission']);
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
            ->middleware('permission:view_research');
        Route::post('/', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'store'])
            ->middleware('permission:create_research_ideas');
        Route::get('/{smartCityResearchRequest}', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'show'])
            ->middleware('permission:view_research');
        Route::put('/{smartCityResearchRequest}', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'update'])
            ->middleware('permission:edit_research_ideas');
        Route::post('/{smartCityResearchRequest}/assign', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'assign'])
            ->middleware('permission:manage-research-projects');
        Route::post('/{smartCityResearchRequest}/complete', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'complete'])
            ->middleware('permission:manage-research-projects');
        Route::get('/{smartCityResearchRequest}/communications', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'communications'])
            ->middleware('permission:view_research');
        Route::post('/{smartCityResearchRequest}/send-communication', [\App\Http\Controllers\Api\SmartCityResearchRequestController::class, 'sendCommunication'])
            ->middleware('permission:view_research');
    });

    // Research Ideas
    Route::prefix('research-ideas')->group(function () {
        Route::get('/', [ResearchIdeaController::class, 'index'])
            ->middleware('permission:view_research');
        Route::get('/assignable-users', [ResearchIdeaController::class, 'getAssignableUsers'])
            ->middleware('permission:assign_research');
        Route::post('/', [ResearchIdeaController::class, 'store'])
            ->middleware('permission:create_research_ideas');
        Route::get('/{researchIdea}', [ResearchIdeaController::class, 'show'])
            ->middleware('permission:view_research');
        Route::put('/{researchIdea}', [ResearchIdeaController::class, 'update'])
            ->middleware('permission:edit_research_ideas');
        Route::delete('/{researchIdea}', [ResearchIdeaController::class, 'destroy'])
            ->middleware('permission:delete_research_ideas');
        Route::post('/{researchIdea}/submit', [ResearchIdeaController::class, 'submit'])
            ->middleware('permission:submit_research_ideas');
        Route::post('/{researchIdea}/assign', [ResearchIdeaController::class, 'assign'])
            ->middleware('permission:assign_research');
        Route::post('/{researchIdea}/update-status', [ResearchIdeaController::class, 'updateStatus'])
            ->middleware('permission:view_research');
        Route::post('/{researchIdea}/attachments', [ResearchIdeaController::class, 'uploadAttachment'])
            ->middleware('permission:view_research');
        Route::get('/{researchIdea}/attachments/{attachmentId}/download', [ResearchIdeaController::class, 'downloadAttachment'])
            ->middleware('permission:view_research');
        Route::get('/{researchIdea}/attachments/{attachmentId}/check-edit-privilege', [ResearchIdeaController::class, 'checkAttachmentEditPrivilege'])
            ->middleware('permission:view_research');
        Route::put('/{researchIdea}/attachments/{attachmentId}', [ResearchIdeaController::class, 'updateAttachment'])
            ->middleware('permission:view_research');
        Route::delete('/{researchIdea}/attachments/{attachmentId}', [ResearchIdeaController::class, 'deleteAttachment'])
            ->middleware('permission:view_research');
    });

    // Research Director Dashboard
    Route::prefix('research/director')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\ResearchDirectorController::class, 'getStats'])
            ->middleware('permission:view_research');
    });

    // Research Reports
    Route::prefix('research/reports')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ResearchReportController::class, 'index'])
            ->middleware('permission:view_research');
        Route::get('/forward-targets', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'forwardTargets'])
            ->middleware('permission:view_research');
        Route::get('/forwarded-to-me', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'receivedForwards'])
            ->middleware('permission:view_research');
        Route::get('/for-idea/{researchIdeaId}', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'statusForResearchIdea'])
            ->middleware('permission:view_research');
        Route::get('/{review}', [\App\Http\Controllers\Api\ResearchReportController::class, 'show'])
            ->middleware('permission:view_research');
        Route::get('/{review}/documents/{document}/download', [\App\Http\Controllers\Api\ResearchReportController::class, 'downloadDocument'])
            ->middleware('permission:view_research');
        Route::get('/{progress}/responses', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'index'])
            ->middleware('permission:view_research');
        Route::post('/{progress}/respond-to-requester', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'respondToRequester'])
            ->middleware('permission:view_research');
        Route::post('/{progress}/forward', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'forward'])
            ->middleware('permission:view_research');
        Route::post('/responses/{response}/resend', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'resend'])
            ->middleware('permission:view_research');
        Route::get('/responses/{response}/certificate', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'downloadCertificate'])
            ->middleware('permission:view_research');
        Route::get('/responses/{response}/view', [\App\Http\Controllers\Api\ResearchReportResponseController::class, 'showResponse'])
            ->middleware('permission:view_research');
    });

    // Research Workflow Management
    Route::prefix('research-workflow-stages')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'storeStage'])
            ->middleware('permission:manage_workflow_stages');
        Route::post('/reorder', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'reorderStages'])
            ->middleware('permission:manage_workflow_stages');
        Route::put('/{stage}', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'updateStage'])
            ->middleware('permission:manage_workflow_stages');
        Route::delete('/{stage}', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'destroyStage'])
            ->middleware('permission:manage_workflow_stages');
    });

    Route::prefix('research-workflow')->group(function () {
        Route::get('/stages', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getStages'])
            ->middleware('permission:view_research');
        Route::get('/team-leaders', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getAvailableTeamLeaders'])
            ->middleware('permission:assign_team_leader');
        Route::get('/officers', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getAvailableOfficers'])
            ->middleware('permission:assign_officer');
        
        Route::prefix('ideas/{researchIdea}')->group(function () {
            Route::get('/progress', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getProgress'])
                ->middleware('permission:view_research');
            Route::post('/initialize', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'initializeWorkflow'])
                ->middleware('permission:manage_research_workflow');
            Route::post('/assign-team-leader', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'assignTeamLeader'])
                ->middleware('permission:assign_team_leader');
            Route::post('/assign-officer', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'assignOfficer'])
                ->middleware('permission:assign_officer');
            Route::get('/assignments', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getAssignments'])
                ->middleware('permission:view_research');
            Route::get('/clearance-certificate', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getClearanceCertificate'])
                ->middleware('permission:view_research');
        });

        Route::prefix('progress/{progress}')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'getProgressItem'])
                ->middleware('permission:view_research');
            Route::post('/start', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'startStage'])
                ->middleware('permission:update_research_progress');
            Route::post('/submit', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'submitStage'])
                ->middleware('permission:submit_research_stage');
            Route::post('/upload-file', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'uploadStageFile'])
                ->middleware('permission:submit_research_stage');
            Route::get('/download-file', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'downloadStageFile'])
                ->middleware('permission:view_research');
            Route::post('/review', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'reviewStage'])
                ->middleware('permission:review_research_stage');
            Route::post('/assign-officer', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'assignStageOfficer'])
                ->middleware('permission:assign_officer');
        });

        Route::prefix('assignments/{assignment}')->group(function () {
            Route::post('/accept', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'acceptAssignment'])
                ->middleware('permission:view_assigned_research');
            Route::post('/start', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'startAssignment'])
                ->middleware('permission:view_assigned_research');
            Route::post('/complete', [\App\Http\Controllers\Api\ResearchWorkflowController::class, 'completeAssignment'])
                ->middleware('permission:view_assigned_research');
        });
    });

    // Research Forward to Smart City
    Route::prefix('research-forward')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ResearchForwardController::class, 'index'])
            ->middleware('permission:view_research');
        Route::post('/ideas/{researchIdea}', [\App\Http\Controllers\Api\ResearchForwardController::class, 'forwardToSmartCity'])
            ->middleware('permission:forward_to_smart_city');
        Route::get('/{forwardRequest}', [\App\Http\Controllers\Api\ResearchForwardController::class, 'show'])
            ->middleware('permission:view_research');
        Route::post('/{forwardRequest}/acknowledge', [\App\Http\Controllers\Api\ResearchForwardController::class, 'acknowledge'])
            ->middleware('permission:view_research');
        Route::put('/{forwardRequest}/status', [\App\Http\Controllers\Api\ResearchForwardController::class, 'updateStatus'])
            ->middleware('permission:view_research');
        Route::get('/{forwardRequest}/attachments/{attachmentIndex}', [\App\Http\Controllers\Api\ResearchForwardController::class, 'downloadAttachment'])
            ->middleware('permission:view_research');
    });

    // Research Team Leader
    Route::prefix('research-team-leader')->middleware('permission:view_assigned_research')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\ResearchTeamLeaderController::class, 'dashboard']);
        Route::get('/assigned-research', [\App\Http\Controllers\Api\ResearchTeamLeaderController::class, 'assignedResearch']);
        Route::get('/officer-assignments', [\App\Http\Controllers\Api\ResearchTeamLeaderController::class, 'officerAssignments']);
        Route::get('/team-members', [\App\Http\Controllers\Api\ResearchTeamLeaderController::class, 'teamMembers']);
        Route::get('/pending-reviews', [\App\Http\Controllers\Api\ResearchTeamLeaderController::class, 'pendingReviews']);
    });

    // Research Officer
    Route::prefix('research-officer')->middleware('permission:view_assigned_task')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\ResearchOfficerController::class, 'dashboard']);
        Route::get('/my-assignments', [\App\Http\Controllers\Api\ResearchOfficerController::class, 'myAssignments']);
        Route::get('/ideas/{ideaId}/stages', [\App\Http\Controllers\Api\ResearchOfficerController::class, 'myStages']);
        Route::post('/assignments/{assignment}/accept', [\App\Http\Controllers\Api\ResearchOfficerController::class, 'acceptAssignment']);
        Route::get('/my-submissions', [\App\Http\Controllers\Api\ResearchOfficerController::class, 'mySubmissions']);
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
