<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Permission>
 */
class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = ['view', 'create', 'edit', 'delete', 'manage'];
        $resources = ['users', 'requests', 'reports', 'settings', 'audits'];
        
        $action = fake()->randomElement($actions);
        $resource = fake()->randomElement($resources);
        $name = "{$action}_{$resource}";
        
        return [
            'name' => $name,
            'display_name' => ucwords(str_replace('_', ' ', $name)),
            'module' => $resource,
            'description' => fake()->sentence(),
        ];
    }
}
