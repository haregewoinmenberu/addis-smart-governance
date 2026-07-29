<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure Passport
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));

        // Bridge our custom role/permission system to Laravel's Gate.
        // This ensures $user->can('some_permission') delegates to our
        // hasPermission() method instead of always returning false when
        // no explicit Gate::define() exists for that ability name.
        Gate::before(function ($user, string $ability) {
            if (method_exists($user, 'hasPermission') && $user->hasPermission($ability)) {
                return true;
            }
            // Return null to fall through to policies / other Gate checks
            return null;
        });
    }
}
