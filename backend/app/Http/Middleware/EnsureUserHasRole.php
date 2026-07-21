<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     * User must have at least ONE of the specified roles AND at least one assigned role.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check if user has ANY assigned roles
        if ($request->user()->roles()->count() === 0) {
            return response()->json([
                'message' => 'Access denied. No roles assigned to your account. Please contact administrator.',
                'error' => 'NO_ROLES_ASSIGNED',
            ], 403);
        }

        // Check if user has required role
        if (!$request->user()->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required role.',
                'required_roles' => $roles,
                'your_roles' => $request->user()->roles->pluck('name')->toArray(),
            ], 403);
        }

        return $next($request);
    }
}
