<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\ServiceFormSubmission;
use App\Models\InstitutionDocument;
use App\Models\InstitutionTeamMember;
use Illuminate\Http\Request;

class InstitutionDashboardController extends Controller
{
    /**
     * Institution Dashboard
     * For institutional_user role
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $institution = $user->institution;

        if (!$institution) {
            return response()->json([
                'error' => 'No institution associated with this user',
                'message' => 'Please contact administrator to link your account to an institution'
            ], 404);
        }

        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',
            'institution_id' => $institution->id,
            'institution_name' => $institution->name,
            'institution_type' => $institution->institution_type,
            'verification_status' => $institution->verification_status,
            'registration_status' => $institution->status,

            // Service Submissions
            'total_submissions' => ServiceFormSubmission::where('institution_id', $institution->id)->count(),
            'pending_submissions' => ServiceFormSubmission::where('institution_id', $institution->id)
                ->where('status', 'pending')->count(),
            'approved_submissions' => ServiceFormSubmission::where('institution_id', $institution->id)
                ->where('status', 'approved')->count(),
            'submissions_by_status' => ServiceFormSubmission::where('institution_id', $institution->id)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            // Documents
            'total_documents' => InstitutionDocument::where('institution_id', $institution->id)->count(),
            'verified_documents' => InstitutionDocument::where('institution_id', $institution->id)
                ->where('is_verified', true)->count(),
            'pending_verification' => InstitutionDocument::where('institution_id', $institution->id)
                ->where('is_verified', false)->count(),

            // Team
            'total_team_members' => InstitutionTeamMember::where('institution_id', $institution->id)->count(),
            'active_members' => InstitutionTeamMember::where('institution_id', $institution->id)
                ->where('status', 'active')->count(),
            'pending_invitations' => InstitutionTeamMember::where('institution_id', $institution->id)
                ->where('status', 'invited')->count(),

            // Recent activity
            'recent_submissions' => ServiceFormSubmission::where('institution_id', $institution->id)
                ->latest()->take(10)->get(),
            'recent_documents' => InstitutionDocument::where('institution_id', $institution->id)
                ->latest()->take(5)->get(),
        ];

        return response()->json($stats);
    }
}
