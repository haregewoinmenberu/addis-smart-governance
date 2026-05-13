<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function show(string $key): JsonResponse
    {
        $modules = [
            'audit' => [
                'title' => 'Audit & Compliance',
                'subtitle' => 'Schedule audits, score compliance, and track corrective actions end-to-end.',
                'points' => [
                    'Audit scheduling calendar',
                    'Compliance heatmaps',
                    'Corrective action workflow',
                    'Risk alerts',
                    'Regulatory reporting',
                    'Timeline audit trails',
                ],
            ],
            'cybersecurity' => [
                'title' => 'Cybersecurity Governance',
                'subtitle' => 'Command center for vulnerability management, incidents, and threat analytics.',
                'points' => [
                    'Vulnerability management',
                    'Security posture analytics',
                    'Incident reporting & response',
                    'Evidence management',
                    'Threat analytics dashboards',
                    'Risk severity indicators',
                ],
            ],
            'duplication' => [
                'title' => 'Duplication Analysis',
                'subtitle' => 'Detect overlapping systems across the city with AI-powered similarity scoring.',
                'points' => [
                    'Side-by-side technology comparison',
                    'Similarity scoring visualization',
                    'Standardization recommendations',
                    'Smart duplicate alerts',
                    'Scalability analysis',
                    'Consolidation opportunity reports',
                ],
            ],
            'feasibility' => [
                'title' => 'Feasibility Studies',
                'subtitle' => 'Evaluate technical, financial, security and operational feasibility of every initiative.',
                'points' => [
                    'Technical feasibility evaluation',
                    'Financial analysis & ROI',
                    'Security assessment',
                    'Operational readiness',
                    'Vendor evaluation',
                    'Risk analysis with SWOT visualization',
                ],
            ],
            'forgot-password' => [
                'title' => 'Forgot Password',
                'subtitle' => 'Recover access to your government account.',
                'points' => [
                    'Email verification',
                    'Identity confirmation',
                    'Secure recovery links',
                    'Audit logging',
                    'SMS fallback',
                    'Multi-factor support',
                ],
            ],
            'notifications' => [
                'title' => 'Notifications',
                'subtitle' => 'Real-time alerts, deadline reminders, and multi-channel delivery status.',
                'points' => [
                    'Real-time notifications',
                    'SMS / email status indicators',
                    'Priority indicators',
                    'Deadline reminders',
                    'Activity feeds',
                    'Alert escalation rules',
                ],
            ],
            'registry' => [
                'title' => 'Technology Registry',
                'subtitle' => 'Centralized inventory of every technology asset deployed across Addis Ababa.',
                'points' => [
                    'Centralized technology database',
                    'Advanced filtering & search',
                    'Map-based deployment visualization',
                    'Hosting environment management',
                    'License & contract tracking',
                    'Security classification labels',
                ],
            ],
            'reports' => [
                'title' => 'Reports & Analytics',
                'subtitle' => 'Executive insights powered by AI across procurement, infrastructure and maturity.',
                'points' => [
                    'Executive reports',
                    'AI-powered insights',
                    'Procurement analytics',
                    'Infrastructure investment analytics',
                    'Technology maturity analytics',
                    'Export to PDF / Excel',
                ],
            ],
            'settings' => [
                'title' => 'Settings',
                'subtitle' => 'Configure system policies, branding, integrations and notification preferences.',
                'points' => [
                    'System configurations',
                    'Workflow settings',
                    'Notification preferences',
                    'Branding settings',
                    'Security policies',
                    'API integrations',
                ],
            ],
            'surveys' => [
                'title' => 'Surveys & Feedback',
                'subtitle' => 'Capture citizen and user sentiment to guide digital service improvements.',
                'points' => [
                    'Survey builders',
                    'Sentiment analysis',
                    'Feedback heatmaps',
                    'Service quality evaluation',
                    'Usability analysis',
                    'Technology impact reports',
                ],
            ],
            'users' => [
                'title' => 'User Management & RBAC',
                'subtitle' => 'Role-based access for Super Admin, ITDB, Auditors, Sub-Cities, Vendors, Analysts.',
                'points' => [
                    'Permission matrix',
                    'Role assignment',
                    'User activity logs',
                    'Access control management',
                    'SSO integration',
                    'Session monitoring',
                ],
            ],
            'vendors' => [
                'title' => 'Vendor Management',
                'subtitle' => 'Onboard, monitor and evaluate technology vendors with SLA scoring.',
                'points' => [
                    'Vendor registration',
                    'Legal document verification',
                    'SLA monitoring',
                    'Vendor performance scoring',
                    'Historical analytics',
                    'Blacklist management',
                ],
            ],
            'workflows' => [
                'title' => 'Approval Workflows',
                'subtitle' => 'Design dynamic approval chains with e-signature and notification routing.',
                'points' => [
                    'Visual workflow builder',
                    'Drag-and-drop approval chains',
                    'E-signature integration',
                    'Multi-level approvals',
                    'Approval history',
                    'Notification routing',
                ],
            ],
        ];

        if (!array_key_exists($key, $modules)) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        return response()->json(['data' => $modules[$key]]);
    }
}
