<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAnyPermission
{
    /**
     * Handle an incoming request.
     * User must have at least ONE of the specified permissions.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$request->user()->hasAnyPermission($permissions)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have any of the required permissions.',
                'required_permissions' => $permissions,
            ], 403);
        }

        return $next($request);
    }
}
