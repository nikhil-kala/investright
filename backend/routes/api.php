<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CreditCardController;
use App\Http\Controllers\Api\GeminiController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

Route::get('/status', fn () => response()->json([
    'message' => 'InvestRight API is running',
    'version' => '4.0.0-laravel',
    'timestamp' => now()->toIso8601String(),
]));

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/contact', [ContactController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/reset-password/{user}', [AuthController::class, 'resetPassword'])
        ->middleware('admin');

    Route::get('/chat/conversations', [ChatController::class, 'index']);
    Route::get('/chat/conversations/{conversationId}', [ChatController::class, 'show']);
    Route::post('/chat/messages', [ChatController::class, 'storeMessage']);
    Route::post('/chat/conversations', [ChatController::class, 'storeConversation']);
    Route::get('/chat/stats', [ChatController::class, 'stats'])->middleware('admin');
    Route::get('/chat/admin/conversations', [ChatController::class, 'adminIndex'])->middleware('admin');

    Route::post('/chat/gemini', [GeminiController::class, 'sendMessage']);

    Route::get('/credit-cards', [CreditCardController::class, 'index']);
    Route::post('/credit-cards', [CreditCardController::class, 'store']);
    Route::put('/credit-cards/{creditCard}', [CreditCardController::class, 'update']);
    Route::delete('/credit-cards/{creditCard}', [CreditCardController::class, 'destroy']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);

    Route::get('/admin/users', [AdminController::class, 'users'])->middleware('admin');
});
