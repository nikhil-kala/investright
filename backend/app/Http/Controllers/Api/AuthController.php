<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated',
            ], 403);
        }

        $user->update(['last_login' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => (new UserResource($user))->resolve(),
            'message' => 'Login successful',
            'token' => $token,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(['admin', 'user', 'moderator'])],
        ]);

        $username = strtolower(trim($validated['firstName']).'.'.trim($validated['lastName']));
        $baseUsername = $username;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername.$counter;
            $counter++;
        }

        $user = User::create([
            'name' => trim($validated['firstName'].' '.$validated['lastName']),
            'username' => $username,
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'user',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'user' => (new UserResource($user))->resolve(),
            'message' => 'Account created successfully',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => (new UserResource($request->user()))->resolve(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $username = strtolower(trim($validated['firstName']).'.'.trim($validated['lastName']));

        $user->update([
            'name' => trim($validated['firstName'].' '.$validated['lastName']),
            'username' => $username,
            'email' => $validated['email'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => (new UserResource($user->fresh()))->resolve(),
        ]);
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user->update(['password' => $validated['password']]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully',
        ]);
    }
}
