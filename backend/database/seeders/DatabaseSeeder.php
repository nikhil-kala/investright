<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'kale.nikhil@gmail.com'],
            [
                'name' => 'Nikhil Kale',
                'username' => 'kale.nikhil@gmail.com',
                'password' => Hash::make('Invest123'),
                'role' => 'admin',
                'is_active' => true,
                'language' => 'en',
            ]
        );

        foreach (['user_management', 'system_admin', 'data_access', 'analytics'] as $permission) {
            UserPermission::firstOrCreate([
                'user_id' => $admin->id,
                'permission_name' => $permission,
            ], [
                'granted_by' => $admin->id,
            ]);
        }

        User::updateOrCreate(
            ['email' => 'demo@investright.com'],
            [
                'name' => 'Demo Admin',
                'username' => 'demo.admin',
                'password' => Hash::make('demo123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@investright.com'],
            [
                'name' => 'Demo User',
                'username' => 'demo.user',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'is_active' => true,
            ]
        );
    }
}
