<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'last_login' => $this->last_login?->toIso8601String(),
            'language' => $this->language,
            'profile_data' => $this->profile_data ?? [],
        ];
    }
}
