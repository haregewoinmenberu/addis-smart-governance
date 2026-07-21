<?php

namespace App\Listeners;

use App\Events\RoleAssigned;
use App\Events\RoleRemoved;
use App\Services\RBACService;
use Illuminate\Contracts\Queue\ShouldQueue;

class ClearUserPermissionCache implements ShouldQueue
{
    protected $rbacService;

    /**
     * Create the event listener.
     */
    public function __construct(RBACService $rbacService)
    {
        $this->rbacService = $rbacService;
    }

    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        if ($event instanceof RoleAssigned || $event instanceof RoleRemoved) {
            $this->rbacService->clearUserCache($event->user);
        }
    }
}
