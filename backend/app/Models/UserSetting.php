<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'notifications',
        'privacy',
        'preferences',
    ];

    protected function casts(): array
    {
        return [
            'notifications' => 'array',
            'privacy' => 'array',
            'preferences' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
