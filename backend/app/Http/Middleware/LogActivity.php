<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users
        if ($request->user()) {
            $this->logRequest($request, $response);
        }

        return $response;
    }

    /**
     * Log the request.
     */
    protected function logRequest(Request $request, Response $response): void
    {
        // Only log state-changing operations
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return;
        }

        // Only log successful operations
        if ($response->getStatusCode() >= 400) {
            return;
        }

        $action = $this->determineAction($request);
        $module = $this->determineModule($request);

        if ($action && $module) {
            ActivityLog::log(
                $action,
                $module,
                null,
                null,
                $request->except(['password', 'password_confirmation', 'token'])
            );
        }
    }

    /**
     * Determine the action from the request.
     */
    protected function determineAction(Request $request): ?string
    {
        return match ($request->method()) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => null,
        };
    }

    /**
     * Determine the module from the request path.
     */
    protected function determineModule(Request $request): ?string
    {
        $path = $request->path();
        
        // Extract module from API path (e.g., api/requests -> requests)
        if (preg_match('/api\/([^\/]+)/', $path, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
