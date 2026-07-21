<?php

namespace App\Observers;

use App\Models\Role;
use App\Services\RBACService;
use Illuminate\Support\Facades\Log;

class RoleObserver
{
    protected $rbacService;

    public function __construct(RBACService $rbacService)
    {
        $this->rbacService = $rbacService;
    }

    /**
     * Handle the Role "updated" event.
     */
    public function updated(Role $role): void
    {
        // Clear cache for all users with this role when permissions change
        if ($role->isDirty('permissions')) {
            $role->users()->chunk(100, function ($users) {
                foreach ($users as $user) {
                    $this->rbacService->clearUserCache($user);
                }
            });
            
            Log::info("Role permissions updated, cache cleared for role: {$role->name}");
        }
    }

    /**
     * Handle the Role "deleted" event.
     */
    public function deleted(Role $role): void
    {
        // Clear cache for all users who had this role
        $role->users()->chunk(100, function ($users) {
            foreach ($users as $user) {
                $this->rbacService->clearUserCache($user);
            }
        });
        
        Log::info("Role deleted, cache cleared for role: {$role->name}");
    }
}
