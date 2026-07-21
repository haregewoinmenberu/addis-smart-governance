<?php

namespace App\Events;

use App\Models\User;
use App\Models\Role;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoleRemoved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $role;
    public $removedBy;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Role $role, ?User $removedBy = null)
    {
        $this->user = $user;
        $this->role = $role;
        $this->removedBy = $removedBy;
    }
}
