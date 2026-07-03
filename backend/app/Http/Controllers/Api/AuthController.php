<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    { 
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        /**
         * @var \App\Models\User $user
         */

        $user = Auth::user();

        // Check if user is active
        if (!$user->is_active) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact the administrator.'],
            ]);
        }

        // Create access token
        $tokenResult = $user->createToken('api');

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Create session record
        UserSession::create([
            'user_id' => $user->id,
            'token_id' => $tokenResult->token->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_activity_at' => now(),
            'expires_at' => $tokenResult->token->expires_at,
        ]);

        // Log activity
        ActivityLog::log('login', 'auth', $user);

        // Load user with roles and permissions
        $user->load('roles.permissions', 'subCity');

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $tokenResult->accessToken,
            'expires_at' => optional($tokenResult->token->expires_at)->toIso8601String(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
                'institution_id' => $user->institution_id,
                'position' => $user->position,
                'sub_city' => $user->subCity ? $user->subCity->name : null,
                'sub_city_id' => $user->sub_city_id,
                'sub_city_details' => $user->subCity ? [
                    'id' => $user->subCity->id,
                    'name' => $user->subCity->name,
                    'code' => $user->subCity->code,
                    'logo' => $user->subCity->logo,
                    'is_active' => $user->subCity->is_active,
                ] : null,
                'department' => $user->department,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'roles' => $user->roles->map(fn($role) => [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ]),
                'permissions' => $user->getAllPermissions(),
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('roles.permissions', 'subCity');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
                'institution_id' => $user->institution_id,
                'position' => $user->position,
                'sub_city' => $user->subCity ? $user->subCity->name : null,
                'sub_city_id' => $user->sub_city_id,
                'sub_city_details' => $user->subCity ? [
                    'id' => $user->subCity->id,
                    'name' => $user->subCity->name,
                    'code' => $user->subCity->code,
                    'logo' => $user->subCity->logo,
                    'is_active' => $user->subCity->is_active,
                ] : null,
                'department' => $user->department,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'last_login_at' => $user->last_login_at,
                'roles' => $user->roles->map(fn($role) => [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ]),
                'permissions' => $user->getAllPermissions(),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $token = $user?->token();
        
        if ($token) {
            // Delete session record
            UserSession::where('token_id', $token->id)->delete();
            
            // Revoke token
            $token->revoke();
            
            // Log activity
            ActivityLog::log('logout', 'auth', $user);
        }

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Get user's active sessions.
     */
    public function sessions(Request $request)
    {
        $sessions = $request->user()
            ->sessions()
            ->where('expires_at', '>', now())
            ->orderBy('last_activity_at', 'desc')
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, $sessionId)
    {
        $session = $request->user()
            ->sessions()
            ->findOrFail($sessionId);

        // Revoke the token
        $token = $request->user()->tokens()->find($session->token_id);
        if ($token) {
            $token->revoke();
        }

        $session->delete();

        return response()->json(['message' => 'Session revoked successfully']);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        $oldValues = $user->toArray();
        $user->update($data);

        ActivityLog::log('update_profile', 'auth', $user, $oldValues, $user->toArray());

        $user->load('roles.permissions', 'subCity');

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
                'institution_id' => $user->institution_id,
                'position' => $user->position,
                'sub_city' => $user->subCity ? $user->subCity->name : null,
                'sub_city_id' => $user->sub_city_id,
                'sub_city_details' => $user->subCity ? [
                    'id' => $user->subCity->id,
                    'name' => $user->subCity->name,
                    'code' => $user->subCity->code,
                    'logo' => $user->subCity->logo,
                    'is_active' => $user->subCity->is_active,
                ] : null,
                'department' => $user->department,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'last_login_at' => $user->last_login_at,
                'roles' => $user->roles->map(fn($role) => [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ]),
                'permissions' => $user->getAllPermissions(),
            ],
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Verify current password
        if (!\Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => \Hash::make($data['password']),
        ]);

        ActivityLog::log('change_password', 'auth', $user);

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Get user activity logs.
     */
    public function activityLogs(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        
        $logs = $request->user()
            ->activityLogs()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Revoke all other sessions.
     */
    public function revokeAllOtherSessions(Request $request)
    {
        $user = $request->user();
        $currentToken = $user->token();

        // Get all sessions except current
        $sessions = $user->sessions()
            ->where('token_id', '!=', $currentToken->id)
            ->get();

        foreach ($sessions as $session) {
            $token = $user->tokens()->find($session->token_id);
            if ($token) {
                $token->revoke();
            }
            $session->delete();
        }

        ActivityLog::log('revoke_all_sessions', 'auth', $user);

        return response()->json([
            'message' => 'All other sessions revoked successfully',
            'revoked_count' => $sessions->count(),
        ]);
    }
}
