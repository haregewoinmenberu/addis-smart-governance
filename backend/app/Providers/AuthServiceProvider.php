<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\Permission;
use App\Policies\RolePolicy;
use App\Policies\PermissionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Role::class => RolePolicy::class,
        Permission::class => PermissionPolicy::class,
        \App\Models\ResearchIdea::class => \App\Policies\ResearchTeamLeaderPolicy::class,
        \App\Models\ResearchWorkflowProgress::class => \App\Policies\ResearchTeamLeaderPolicy::class,
        \App\Models\ResearchAssignment::class => \App\Policies\ResearchTeamLeaderPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
    }
}
