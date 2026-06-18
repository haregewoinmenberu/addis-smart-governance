<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\CybersecurityIssueController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DuplicationCaseController;
use App\Http\Controllers\Api\FeasibilityStudyController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\NotificationController;
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

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
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

    // Service Form Submissions - Protected routes
    Route::prefix('service-forms')->group(function () {
        Route::get('/my-submissions', [ServiceFormSubmissionController::class, 'listUserSubmissions']);
    });
});
