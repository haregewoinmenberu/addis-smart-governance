<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CybersecurityIssue;
use App\Models\DuplicationCase;
use App\Models\RequestItem;
use App\Models\Technology;
use App\Models\Vendor;

class DashboardController extends Controller
{
    public function index()
    {
        $registered = Technology::count();
        $pendingRequests = RequestItem::where('status', 'Pending')->count();
        $activeProjects = RequestItem::whereIn('status', ['Approved', 'In review'])->count();
        $duplicateSystems = DuplicationCase::count();
        $highRisk = CybersecurityIssue::where('severity', 'High')->count();
        $complianceRate = 92;
        $vendorScore = (int) round(Vendor::avg('score') ?? 0);

        return response()->json([
            'stats' => [
                ['label' => 'Registered Technologies', 'value' => $registered, 'delta' => '+8.2%', 'trend' => 'up', 'accent' => 'primary'],
                ['label' => 'Active Projects', 'value' => $activeProjects, 'delta' => '+4.1%', 'trend' => 'up', 'accent' => 'info'],
                ['label' => 'Pending Requests', 'value' => $pendingRequests, 'delta' => '-12%', 'trend' => 'down', 'accent' => 'warning'],
                ['label' => 'Duplicate Systems', 'value' => $duplicateSystems, 'delta' => '-3', 'trend' => 'down', 'accent' => 'destructive'],
                ['label' => 'Cybersecurity Risk', 'value' => $highRisk, 'delta' => '-6 pts', 'trend' => 'down', 'accent' => 'success'],
                ['label' => 'Compliance Rate', 'value' => $complianceRate, 'delta' => '+2.4%', 'trend' => 'up', 'accent' => 'success'],
                ['label' => 'Vendor Performance', 'value' => $vendorScore, 'delta' => '+1.8', 'trend' => 'up', 'accent' => 'primary'],
                ['label' => 'Smart City Index', 'value' => 74.6, 'delta' => '+3.1', 'trend' => 'up', 'accent' => 'info'],
            ],
            'investment' => [
                ['m' => 'Jan', 'v' => 2.4, 'c' => 1.8],
                ['m' => 'Feb', 'v' => 3.1, 'c' => 2.2],
                ['m' => 'Mar', 'v' => 2.8, 'c' => 2.5],
                ['m' => 'Apr', 'v' => 3.6, 'c' => 2.9],
                ['m' => 'May', 'v' => 4.2, 'c' => 3.1],
                ['m' => 'Jun', 'v' => 4.8, 'c' => 3.6],
                ['m' => 'Jul', 'v' => 5.4, 'c' => 4.0],
                ['m' => 'Aug', 'v' => 5.1, 'c' => 4.4],
                ['m' => 'Sep', 'v' => 6.2, 'c' => 4.9],
            ],
            'subcity' => [
                ['name' => 'Bole', 'v' => 142],
                ['name' => 'Yeka', 'v' => 118],
                ['name' => 'Kirkos', 'v' => 96],
                ['name' => 'Arada', 'v' => 84],
                ['name' => 'Gulele', 'v' => 71],
                ['name' => 'Lideta', 'v' => 63],
                ['name' => 'Akaki', 'v' => 52],
            ],
            'compliance' => [
                ['name' => 'Compliant', 'v' => 68, 'c' => 'var(--color-success)'],
                ['name' => 'Pending', 'v' => 22, 'c' => 'var(--color-warning)'],
                ['name' => 'At risk', 'v' => 10, 'c' => 'var(--color-destructive)'],
            ],
            'insights' => [
                ['t' => '3 sub-cities show overlapping ERP procurement', 'b' => 'Consolidation could save ~ETB 14M annually.'],
                ['t' => 'Cybersecurity posture improving', 'b' => 'Threat exposure dropped 18% across critical assets.'],
                ['t' => "Vendor 'Sheba Tech' breached SLA twice", 'b' => 'Recommend escalation to procurement review.'],
            ],
            'approvals' => [
                ['t' => 'Smart Traffic Management v2', 'o' => 'Bole Sub-City', 's' => 'Approved', 'v' => 'success'],
                ['t' => 'e-Permit Issuance Platform', 'o' => 'Arada Sub-City', 's' => 'In review', 'v' => 'warning'],
                ['t' => 'Citizen Feedback Portal', 'o' => 'ITDB Central', 's' => 'Approved', 'v' => 'success'],
                ['t' => 'Municipal Asset Tracker', 'o' => 'Kirkos Sub-City', 's' => 'Rejected', 'v' => 'destructive'],
                ['t' => 'Waste Routing AI', 'o' => 'Yeka Sub-City', 's' => 'Pending', 'v' => 'warning'],
            ],
            'readiness' => [
                ['l' => 'Digital infrastructure', 'v' => 82],
                ['l' => 'Cybersecurity maturity', 'v' => 71],
                ['l' => 'Data interoperability', 'v' => 64],
                ['l' => 'Citizen services digitization', 'v' => 78],
                ['l' => 'Governance & compliance', 'v' => 89],
            ],
        ]);
    }
}
