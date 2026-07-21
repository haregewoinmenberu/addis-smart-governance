<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\RoleHierarchyService;

class EnforceHierarchy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check if user has user management capability
        if (!RoleHierarchyService::hasUserManagementCapability($request->user())) {
            return response()->json([
                'message' => 'Unauthorized. You do not have user management permissions.',
                'error' => 'NO_USER_MANAGEMENT_CAPABILITY',
            ], 403);
        }

        return $next($request);
    }
}
