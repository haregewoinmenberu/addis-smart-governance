<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $user = $request->user();
        $tokenResult = $user->createToken('api');

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $tokenResult->accessToken,
            'expires_at' => optional($tokenResult->token->expires_at)->toIso8601String(),
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->token();
        if ($token) {
            $token->revoke();
        }

        return response()->json(['message' => 'Logged out']);
    }
}
