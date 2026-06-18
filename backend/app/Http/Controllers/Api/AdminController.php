<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function users(): JsonResponse
    {
        $users = User::orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'users' => UserResource::collection($users)->resolve(),
        ]);
    }
}
