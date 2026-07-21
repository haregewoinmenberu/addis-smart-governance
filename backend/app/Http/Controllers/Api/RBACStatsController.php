<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RBACService;
use Illuminate\Http\Request;

class RBACStatsController extends Controller
{
    protected $rbacService;

    public function __construct(RBACService $rbacService)
    {
        $this->rbacService = $rbacService;
    }

    /**
     * Get comprehensive RBAC statistics.
     */
    public function index()
    {
        return response()->json([
            'permissions' => $this->rbacService->getPermissionStats(),
            'roles' => $this->rbacService->getRoleStats(),
            'users' => $this->rbacService->getUserStats(),
        ]);
    }

    /**
     * Get permission statistics.
     */
    public function permissions()
    {
        return response()->json($this->rbacService->getPermissionStats());
    }

    /**
     * Get role statistics.
     */
    public function roles()
    {
        return response()->json($this->rbacService->getRoleStats());
    }

    /**
     * Get user statistics.
     */
    public function users()
    {
        return response()->json($this->rbacService->getUserStats());
    }

    /**
     * Clear RBAC cache.
     */
    public function clearCache(Request $request)
    {
        if ($request->has('user_id')) {
            $user = \App\Models\User::findOrFail($request->input('user_id'));
            $this->rbacService->clearUserCache($user);
            $message = "Cache cleared for user: {$user->name}";
        } else {
            $this->rbacService->clearAllCache();
            $message = 'All RBAC caches cleared successfully';
        }

        return response()->json([
            'message' => $message,
        ]);
    }
}
