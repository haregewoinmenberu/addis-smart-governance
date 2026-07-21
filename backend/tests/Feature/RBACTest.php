<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RBACTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test permissions
        $this->permissions = [
            Permission::create(['name' => 'view_users', 'display_name' => 'View Users', 'module' => 'users']),
            Permission::create(['name' => 'create_users', 'display_name' => 'Create Users', 'module' => 'users']),
            Permission::create(['name' => 'edit_users', 'display_name' => 'Edit Users', 'module' => 'users']),
        ];

        // Create test role
        $this->role = Role::create([
            'name' => 'test_role',
            'display_name' => 'Test Role',
            'description' => 'A test role',
        ]);

        $this->role->permissions()->sync([$this->permissions[0]->id, $this->permissions[1]->id]);

        // Create test user
        $this->user = User::factory()->create();
    }

    /** @test */
    public function user_can_be_assigned_a_role()
    {
        $this->user->assignRole($this->role);

        $this->assertTrue($this->user->hasRole('test_role'));
        $this->assertCount(1, $this->user->roles);
    }

    /** @test */
    public function user_can_have_multiple_roles()
    {
        $role2 = Role::create([
            'name' => 'second_role',
            'display_name' => 'Second Role',
        ]);

        $this->user->assignRole($this->role);
        $this->user->assignRole($role2);

        $this->assertTrue($this->user->hasAllRoles(['test_role', 'second_role']));
        $this->assertCount(2, $this->user->roles);
    }

    /** @test */
    public function user_can_be_removed_from_role()
    {
        $this->user->assignRole($this->role);
        $this->assertTrue($this->user->hasRole('test_role'));

        $this->user->removeRole($this->role);
        $this->assertFalse($this->user->hasRole('test_role'));
    }

    /** @test */
    public function user_inherits_permissions_from_role()
    {
        $this->user->assignRole($this->role);

        $this->assertTrue($this->user->hasPermission('view_users'));
        $this->assertTrue($this->user->hasPermission('create_users'));
        $this->assertFalse($this->user->hasPermission('edit_users'));
    }

    /** @test */
    public function user_can_check_multiple_permissions()
    {
        $this->user->assignRole($this->role);

        $this->assertTrue($this->user->hasAnyPermission(['view_users', 'edit_users']));
        $this->assertFalse($this->user->hasAllPermissions(['view_users', 'edit_users']));
        $this->assertTrue($this->user->hasAllPermissions(['view_users', 'create_users']));
    }

    /** @test */
    public function role_can_give_permission()
    {
        $this->role->givePermissionTo($this->permissions[2]);

        $this->assertTrue($this->role->hasPermission('edit_users'));
        $this->assertCount(3, $this->role->permissions);
    }

    /** @test */
    public function role_can_revoke_permission()
    {
        $this->role->givePermissionTo($this->permissions[2]);
        $this->assertTrue($this->role->hasPermission('edit_users'));

        $this->role->revokePermissionTo($this->permissions[2]);
        $this->assertFalse($this->role->hasPermission('edit_users'));
    }

    /** @test */
    public function authenticated_user_can_view_their_permissions()
    {
        $this->user->assignRole($this->role);
        
        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                    'permissions',
                ]
            ]);

        $this->assertContains('view_users', $response->json('user.permissions'));
        $this->assertContains('create_users', $response->json('user.permissions'));
    }

    /** @test */
    public function middleware_blocks_user_without_permission()
    {
        $this->user->assignRole($this->role);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/users', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        // User has create_users permission, should succeed or get validation error, not 403
        $response->assertStatus(200)->assertStatus(422)->assertStatus(201);

        // Try action user doesn't have permission for
        $response = $this->actingAs($this->user, 'api')
            ->deleteJson('/api/users/1');

        $response->assertStatus(403);
    }

    /** @test */
    public function sync_roles_replaces_all_user_roles()
    {
        $role2 = Role::create([
            'name' => 'second_role',
            'display_name' => 'Second Role',
        ]);

        $this->user->assignRole($this->role);
        $this->assertCount(1, $this->user->roles);

        $this->user->syncRoles([$role2->name]);
        $this->user->load('roles');

        $this->assertCount(1, $this->user->roles);
        $this->assertTrue($this->user->hasRole('second_role'));
        $this->assertFalse($this->user->hasRole('test_role'));
    }

    /** @test */
    public function get_all_permissions_returns_unique_permission_names()
    {
        $role2 = Role::create([
            'name' => 'second_role',
            'display_name' => 'Second Role',
        ]);

        // Both roles have view_users permission
        $role2->permissions()->sync([$this->permissions[0]->id]);

        $this->user->assignRole($this->role);
        $this->user->assignRole($role2);

        $permissions = $this->user->getAllPermissions();

        // Should not have duplicates
        $this->assertEquals(count($permissions), count(array_unique($permissions)));
    }
}
