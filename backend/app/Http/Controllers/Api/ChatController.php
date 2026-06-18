<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(private ConversationService $conversationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversations = $this->conversationService->getUserConversations($user->email);

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, string $conversationId): JsonResponse
    {
        $user = $request->user();
        $conversation = $this->conversationService->getConversation($conversationId, $user->email);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Conversation not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    public function storeMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_email' => ['required', 'email'],
            'message_text' => ['required', 'string', 'max:5000'],
            'sender' => ['required', 'in:user,bot'],
            'conversation_id' => ['required', 'string', 'max:100'],
            'timestamp' => ['nullable', 'date'],
            'message_type' => ['nullable', 'in:text,plan,system'],
        ]);

        $user = $request->user();

        if ($validated['user_email'] !== $user->email && !in_array($user->role, ['admin', 'moderator'], true)) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot store messages for another user',
            ], 403);
        }

        $message = $this->conversationService->storeMessage(
            $validated,
            $user->id
        );

        return response()->json([
            'success' => true,
            'messageId' => $message->id,
        ], 201);
    }

    public function storeConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_email' => ['required', 'email'],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'message_count' => ['nullable', 'integer'],
            'messages' => ['required', 'array'],
            'messages.*.message_text' => ['required', 'string'],
            'messages.*.sender' => ['required', 'in:user,bot'],
            'messages.*.timestamp' => ['nullable', 'date'],
            'conversation_id' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();

        if ($validated['user_email'] !== $user->email) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot store conversations for another user',
            ], 403);
        }

        $conversationId = $this->conversationService->storeConversation($validated, $user->id);

        return response()->json([
            'success' => true,
            'conversationId' => $conversationId,
        ], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $conversations = $this->conversationService->getAllConversations();

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    public function stats(): JsonResponse
    {
        $totalMessages = ChatMessage::count();
        $uniqueConversations = Conversation::count();
        $uniqueUsers = Conversation::distinct('user_email')->count('user_email');
        $conversationsThisWeek = Conversation::where('last_message_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'totalConversations' => $uniqueConversations,
                'totalMessages' => $totalMessages,
                'uniqueUsers' => $uniqueUsers,
                'conversationsThisWeek' => $conversationsThisWeek,
            ],
        ]);
    }
}
