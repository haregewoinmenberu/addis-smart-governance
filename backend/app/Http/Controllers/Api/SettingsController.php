<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class SettingsController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => [
                ['category' => 'Branding', 'name' => 'Portal identity', 'status' => 'Configured'],
                ['category' => 'Security', 'name' => 'Password policy', 'status' => 'Enforced'],
                ['category' => 'Integrations', 'name' => 'SMS gateway', 'status' => 'Pending'],
                ['category' => 'Notifications', 'name' => 'Email templates', 'status' => 'Configured'],
                ['category' => 'Workflow', 'name' => 'Approval SLA rules', 'status' => 'Configured'],
            ],
        ]);
    }
}
