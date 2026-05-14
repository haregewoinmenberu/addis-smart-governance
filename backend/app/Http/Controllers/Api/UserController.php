<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'subCity']);

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by sub-city (for ITDB Admin viewing sub-city admins)
        if ($request->has('sub_city_id')) {
            $query->where('sub_city_id', $request->sub_city_id);
        } elseif ($request->has('sub_city')) {
            $query->whereHas('subCity', function ($q) use ($request) {
                $q->where('name', $request->sub_city);
            });
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'data' => $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'sub_city' => $user->subCity ? $user->subCity->name : null,
                'department' => $user->department,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'last_login_at' => $user->last_login_at,
                'roles' => $user->roles->map(fn($role) => [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ]),
                'created_at' => $user->created_at,
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'sub_city_id' => ['nullable', 'exists:sub_cities,id'],
            'department' => ['nullable', 'string', 'max:255'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $roles = $data['roles'];
        unset($data['roles']);

        $user = User::create($data);
        
        // Assign roles
        $user->syncRoles($roles);

        ActivityLog::log('create', 'users', $user, null, $data);

        $user->load('roles', 'subCity');

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with('roles.permissions', 'activityLogs', 'subCity')->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'sub_city' => $user->subCity ? $user->subCity->name : null,
                'department' => $user->department,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'last_login_at' => $user->last_login_at,
                'roles' => $user->roles,
                'permissions' => $user->getAllPermissions(),
                'recent_activity' => $user->activityLogs()
                    ->latest()
                    ->limit(10)
                    ->get(),
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'sub_city_id' => ['nullable', 'exists:sub_cities,id'],
            'department' => ['nullable', 'string', 'max:255'],
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        $oldValues = $user->toArray();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (isset($data['roles'])) {
            $roles = $data['roles'];
            unset($data['roles']);
            $user->syncRoles($roles);
        }

        $user->update($data);

        ActivityLog::log('update', 'users', $user, $oldValues, $user->toArray());

        $user->load('roles');

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 422);
        }

        ActivityLog::log('delete', 'users', $user, $user->toArray(), null);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Activate/deactivate user.
     */
    public function toggleActive(string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deactivating yourself
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot deactivate your own account',
            ], 422);
        }

        $user->update(['is_active' => !$user->is_active]);

        ActivityLog::log(
            $user->is_active ? 'activate' : 'deactivate',
            'users',
            $user
        );

        return response()->json([
            'message' => $user->is_active ? 'User activated' : 'User deactivated',
            'data' => $user,
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        ActivityLog::log('reset_password', 'users', $user);

        return response()->json(['message' => 'Password reset successfully']);
    }

    /**
     * Get user activity logs.
     */
    public function activityLogs(string $id)
    {
        $user = User::findOrFail($id);

        $logs = $user->activityLogs()
            ->with('subject')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
}
