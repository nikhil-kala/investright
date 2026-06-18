<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeminiController extends Controller
{
    public function __construct(private GeminiChatService $geminiChatService)
    {
    }

    /**
     * Server-side Gemini proxy — keeps API key off the client.
     * Full conversational flow logic remains in the React chatbot for now;
     * this endpoint supports direct AI calls and future backend migration.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'conversation_history' => ['nullable', 'array'],
            'conversation_history.*.role' => ['required_with:conversation_history', 'in:user,assistant'],
            'conversation_history.*.content' => ['required_with:conversation_history', 'string'],
            'system_prompt' => ['nullable', 'string', 'max:10000'],
            'conversation_id' => ['nullable', 'string', 'max:100'],
        ]);

        $result = $this->geminiChatService->sendMessage(
            $validated['message'],
            $validated['conversation_history'] ?? [],
            $validated['system_prompt'] ?? null
        );

        if (isset($validated['conversation_id'])) {
            $result['conversationId'] = $validated['conversation_id'];
        }

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}
