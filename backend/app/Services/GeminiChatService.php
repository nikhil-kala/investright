<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiChatService
{
    public function sendMessage(string $userMessage, array $conversationHistory = [], ?string $systemPrompt = null): array
    {
        $apiKey = config('services.openai.api_key');

        if (!$apiKey) {
            return [
                'success' => false,
                'message' => 'OpenAI API key not configured on server.',
            ];
        }

        $model = config('services.openai.model', 'gpt-4o-mini');
        $system = $systemPrompt ?? $this->defaultSystemPrompt();

        $messages = [
            ['role' => 'system', 'content' => $system],
        ];

        foreach ($conversationHistory as $entry) {
            $role = ($entry['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user';
            $messages[] = [
                'role' => $role,
                'content' => $entry['content'] ?? '',
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        try {
            $response = Http::timeout(60)
                ->withToken($apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => $messages,
                    'temperature' => 0.7,
                    'max_tokens' => 4096,
                ]);

            if (!$response->successful()) {
                Log::error('OpenAI API error', ['body' => $response->body()]);

                return [
                    'success' => false,
                    'message' => 'Unable to generate AI response. Please try again.',
                ];
            }

            $text = data_get($response->json(), 'choices.0.message.content');

            if (!$text) {
                return [
                    'success' => false,
                    'message' => 'Unable to generate response',
                ];
            }

            return [
                'success' => true,
                'message' => trim($text),
                'isGeneratingPlan' => count($conversationHistory) >= 6,
            ];
        } catch (\Throwable $e) {
            Log::error('OpenAI API exception: '.$e->getMessage());

            return [
                'success' => false,
                'message' => 'I apologize, but I encountered an error. Please try again.',
            ];
        }
    }

    private function defaultSystemPrompt(): string
    {
        return <<<'PROMPT'
You are InvestRight Bot, an expert financial advisor for Indian users. Provide clear, practical investment guidance.
Ask structured questions when needed, use Indian currency (INR), and keep responses concise and actionable.
Always end investment advice with: "This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision."
PROMPT;
    }
}
