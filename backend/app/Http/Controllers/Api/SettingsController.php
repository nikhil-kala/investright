<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $settings = $request->user()->settings ?? $this->defaultSettings($request->user()->id);

        return response()->json([
            'success' => true,
            'settings' => $this->formatSettings($settings),
            'message' => 'Settings retrieved successfully',
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme' => ['nullable', Rule::in(['light', 'dark', 'auto'])],
            'language' => ['nullable', 'string', 'max:10'],
            'email_notifications' => ['nullable', 'boolean'],
            'push_notifications' => ['nullable', 'boolean'],
            'sms_notifications' => ['nullable', 'boolean'],
            'profile_visibility' => ['nullable', 'string'],
            'data_sharing' => ['nullable', 'boolean'],
            'analytics' => ['nullable', 'boolean'],
            'currency' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:100'],
            'date_format' => ['nullable', 'string', 'max:20'],
        ]);

        $user = $request->user();

        $settings = UserSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => $validated['theme'] ?? 'light',
                'language' => $validated['language'] ?? 'en',
                'notifications' => [
                    'email' => $validated['email_notifications'] ?? true,
                    'push' => $validated['push_notifications'] ?? false,
                    'sms' => $validated['sms_notifications'] ?? false,
                ],
                'privacy' => [
                    'profile_visibility' => $validated['profile_visibility'] ?? 'private',
                    'data_sharing' => $validated['data_sharing'] ?? false,
                    'analytics' => $validated['analytics'] ?? true,
                ],
                'preferences' => [
                    'currency' => $validated['currency'] ?? 'INR',
                    'timezone' => $validated['timezone'] ?? 'Asia/Kolkata',
                    'date_format' => $validated['date_format'] ?? 'DD/MM/YYYY',
                ],
            ]
        );

        return response()->json([
            'success' => true,
            'settings' => $this->formatSettings($settings),
            'message' => 'Settings updated successfully',
        ]);
    }

    private function defaultSettings(int $userId): UserSetting
    {
        return new UserSetting([
            'user_id' => $userId,
            'theme' => 'light',
            'language' => 'en',
            'notifications' => ['email' => true, 'push' => false, 'sms' => false],
            'privacy' => ['profile_visibility' => 'private', 'data_sharing' => false, 'analytics' => true],
            'preferences' => ['currency' => 'INR', 'timezone' => 'Asia/Kolkata', 'date_format' => 'DD/MM/YYYY'],
        ]);
    }

    private function formatSettings(UserSetting $settings): array
    {
        return [
            'id' => $settings->id,
            'user_id' => $settings->user_id,
            'theme' => $settings->theme,
            'language' => $settings->language,
            'notifications' => $settings->notifications ?? [],
            'privacy' => $settings->privacy ?? [],
            'preferences' => $settings->preferences ?? [],
            'created_at' => $settings->created_at?->toIso8601String(),
            'updated_at' => $settings->updated_at?->toIso8601String(),
        ];
    }
}
