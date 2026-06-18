<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('name');
            $table->enum('role', ['admin', 'user', 'moderator'])->default('user')->after('password');
            $table->boolean('is_active')->default(true)->after('role');
            $table->timestamp('last_login')->nullable()->after('is_active');
            $table->json('profile_data')->nullable()->after('last_login');
            $table->enum('language', ['en', 'hi', 'mr'])->default('en')->after('profile_data');
        });

        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('permission_name', 100);
            $table->timestamp('granted_at')->useCurrent();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unique(['user_id', 'permission_name']);
        });

        Schema::create('conversations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_email')->index();
            $table->string('title')->default('Investment Discussion');
            $table->text('summary')->nullable();
            $table->unsignedInteger('message_count')->default(0);
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->enum('language', ['en', 'hi', 'mr'])->default('en');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->index(['user_email', 'last_message_at']);
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('conversation_id');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_email')->index();
            $table->text('message_text');
            $table->enum('sender', ['user', 'bot']);
            $table->enum('message_type', ['text', 'plan', 'system'])->default('text');
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
            $table->index(['conversation_id', 'sent_at']);
        });

        Schema::create('credit_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('card_number_masked', 20);
            $table->string('card_holder_name');
            $table->unsignedTinyInteger('expiry_month');
            $table->unsignedSmallInteger('expiry_year');
            $table->enum('card_type', ['visa', 'mastercard', 'amex', 'discover'])->default('visa');
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('theme', ['light', 'dark', 'auto'])->default('light');
            $table->string('language', 10)->default('en');
            $table->json('notifications')->nullable();
            $table->json('privacy')->nullable();
            $table->json('preferences')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied'])->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('credit_cards');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('user_permissions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role', 'is_active', 'last_login', 'profile_data', 'language']);
        });
    }
};
