<?php

namespace App\Observers;

use App\Models\User;
use App\Services\RBACService;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    protected $rbacService;

    public function __construct(RBACService $rbacService)
    {
        $this->rbacService = $rbacService;
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        Log::info("User created: {$user->email}");
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Clear cache when user's active status or roles change
        if ($user->isDirty(['is_active', 'roles'])) {
            $this->rbacService->clearUserCache($user);
            Log::info("User updated, cache cleared for: {$user->email}");
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        $this->rbacService->clearUserCache($user);
        Log::info("User deleted, cache cleared for: {$user->email}");
    }
}
