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

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('health', function () {
    return response()->json(['status' => 'ok']);
});

Route::middleware('auth:api')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('modules/{key}', [ModuleController::class, 'show']);
    Route::get('settings', [SettingsController::class, 'index']);

    Route::apiResource('technologies', TechnologyController::class);
    Route::apiResource('requests', RequestItemController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('vendors', VendorController::class);
    Route::apiResource('workflows', WorkflowController::class);
    Route::apiResource('surveys', SurveyController::class);
    Route::apiResource('reports', ReportController::class);
    Route::apiResource('notifications', NotificationController::class);
    Route::apiResource('audits', AuditController::class);
    Route::apiResource('cybersecurity', CybersecurityIssueController::class);
    Route::apiResource('duplications', DuplicationCaseController::class);
    Route::apiResource('feasibility-studies', FeasibilityStudyController::class);
});
