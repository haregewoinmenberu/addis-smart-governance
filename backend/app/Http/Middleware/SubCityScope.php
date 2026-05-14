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
     * This middleware ensures that sub-city administrators can only access
     * data belonging to their own sub-city organization.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Skip for super admins and ITDB staff
        if ($user->hasRole(['super_admin', 'itdb_admin', 'auditor'])) {
            return $next($request);
        }

        // For sub-city admins and users, scope to their sub-city
        if ($user->sub_city_id) {
            // Add sub-city filter to request
            $request->merge(['scoped_sub_city_id' => $user->sub_city_id]);
        }

        return $next($request);
    }
}
