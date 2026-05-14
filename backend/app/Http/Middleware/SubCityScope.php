<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubCityScope
{
    /**
     * Handle an incoming request.
     * 
     * This middleware ensures that sub-city users can only access
     * data belonging to their own sub-city organization.
     * 
     * Hierarchy:
     * - ITDB Administrator: System-wide access (all sub-cities)
     * - ITDB Auditor: System-wide access (all sub-cities)
     * - Sub-City Administrator: Own sub-city only
     * - Sub-City Auditor: Own sub-city only
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // ITDB users (Administrator and Auditor) have system-wide access
        if ($user->isITDBUser()) {
            return $next($request);
        }

        // Sub-city users are restricted to their sub-city
        if ($user->isSubCityUser()) {
            // Ensure user has a sub-city assigned
            if (!$user->sub_city_id) {
                return response()->json([
                    'message' => 'No sub-city assigned to your account. Please contact administrator.',
                ], 403);
            }

            // Add sub-city filter to request for automatic scoping
            $request->merge([
                'scoped_sub_city_id' => $user->sub_city_id,
                '_sub_city_scope' => $user->sub_city_id,
            ]);
            
            return $next($request);
        }

        // Users without proper roles are denied
        return response()->json([
            'message' => 'Insufficient permissions. No valid role assigned.',
        ], 403);
    }
}
