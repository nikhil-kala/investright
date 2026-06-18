<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\Conversation;
use Illuminate\Support\Str;

class ConversationService
{
    public function generateConversationId(): string
    {
        return 'conv_'.time().'_'.Str::random(9);
    }

    public function getUserConversations(string $userEmail): array
    {
        return Conversation::where('user_email', $userEmail)
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn (Conversation $conv) => [
                'id' => $conv->id,
                'title' => $conv->title,
                'summary' => $conv->summary ?? '',
                'message_count' => $conv->message_count,
                'created_at' => $conv->created_at?->toIso8601String(),
                'last_message_at' => $conv->last_message_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    public function getConversation(string $conversationId, string $userEmail): ?array
    {
        $conversation = Conversation::with('messages')
            ->where('id', $conversationId)
            ->where('user_email', $userEmail)
            ->first();

        if (!$conversation) {
            return null;
        }

        return $this->formatConversation($conversation);
    }

    public function getAllConversations(): array
    {
        return Conversation::with('messages')
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (Conversation $conv) {
                $formatted = $this->formatConversation($conv);
                $formatted['user_email'] = $conv->user_email;

                return $formatted;
            })
            ->values()
            ->all();
    }

    public function storeMessage(array $data, ?int $userId): ChatMessage
    {
        $conversationId = $data['conversation_id'];
        $sentAt = isset($data['timestamp']) ? $data['timestamp'] : now();

        $this->ensureConversationExists(
            $conversationId,
            $data['user_email'],
            $userId,
            $data['message_text'],
            $sentAt
        );

        $message = ChatMessage::create([
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'user_email' => $data['user_email'],
            'message_text' => $data['message_text'],
            'sender' => $data['sender'],
            'message_type' => $data['message_type'] ?? 'text',
            'sent_at' => $sentAt,
        ]);

        $this->updateConversationMeta($conversationId);

        return $message;
    }

    public function storeConversation(array $data, ?int $userId): string
    {
        $conversationId = $data['conversation_id'] ?? $this->generateConversationId();

        $conversation = Conversation::firstOrCreate(
            ['id' => $conversationId],
            [
                'user_id' => $userId,
                'user_email' => $data['user_email'],
                'title' => $data['title'],
                'summary' => $data['summary'] ?? '',
                'message_count' => 0,
                'last_message_at' => now(),
            ]
        );

        foreach ($data['messages'] as $msg) {
            ChatMessage::create([
                'conversation_id' => $conversationId,
                'user_id' => $userId,
                'user_email' => $data['user_email'],
                'message_text' => $msg['message_text'],
                'sender' => $msg['sender'],
                'sent_at' => $msg['timestamp'] ?? now(),
            ]);
        }

        $this->updateConversationMeta($conversationId);

        return $conversationId;
    }

    private function ensureConversationExists(
        string $conversationId,
        string $userEmail,
        ?int $userId,
        string $firstMessageText,
        $sentAt
    ): void {
        if (Conversation::where('id', $conversationId)->exists()) {
            return;
        }

        $title = strlen($firstMessageText) > 50
            ? substr($firstMessageText, 0, 50).'...'
            : $firstMessageText;

        Conversation::create([
            'id' => $conversationId,
            'user_id' => $userId,
            'user_email' => $userEmail,
            'title' => $title ?: 'Investment Discussion',
            'summary' => 'Financial advisory session',
            'message_count' => 0,
            'last_message_at' => $sentAt,
        ]);
    }

    private function updateConversationMeta(string $conversationId): void
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return;
        }

        $messages = ChatMessage::where('conversation_id', $conversationId)
            ->orderBy('sent_at')
            ->get();

        $firstUserMessage = $messages->firstWhere('sender', 'user');
        $title = $firstUserMessage
            ? (strlen($firstUserMessage->message_text) > 50
                ? substr($firstUserMessage->message_text, 0, 50).'...'
                : $firstUserMessage->message_text)
            : $conversation->title;

        $conversation->update([
            'title' => $title,
            'summary' => $this->generateSummary($messages),
            'message_count' => $messages->count(),
            'last_message_at' => $messages->last()?->sent_at ?? now(),
        ]);
    }

    private function generateSummary($messages): string
    {
        $firstUser = $messages->firstWhere('sender', 'user');

        if (!$firstUser) {
            return 'Bot conversation';
        }

        $text = strtolower($firstUser->message_text);

        return match (true) {
            str_contains($text, 'invest') => 'Investment discussion',
            str_contains($text, 'goal') || str_contains($text, 'plan') => 'Financial goal planning',
            str_contains($text, 'risk') => 'Risk assessment',
            str_contains($text, 'retire') => 'Retirement planning',
            default => 'Financial advisory session',
        };
    }

    private function formatConversation(Conversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'user_email' => $conversation->user_email,
            'title' => $conversation->title,
            'summary' => $conversation->summary ?? '',
            'message_count' => $conversation->message_count,
            'created_at' => $conversation->created_at?->toIso8601String(),
            'last_message_at' => $conversation->last_message_at?->toIso8601String(),
            'messages' => $conversation->messages->map(fn (ChatMessage $msg) => [
                'id' => $msg->id,
                'user_email' => $msg->user_email,
                'message_text' => $msg->message_text,
                'sender' => $msg->sender,
                'timestamp' => $msg->sent_at?->toIso8601String(),
                'conversation_id' => $msg->conversation_id,
            ])->values()->all(),
        ];
    }
}
