const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export function getOpenAIApiKey(): string | undefined {
  return import.meta.env.VITE_OPENAI_API_KEY;
}

export function getOpenAIModel(): string {
  return import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
}

export function isOpenAIConfigured(): boolean {
  const key = getOpenAIApiKey();
  return !!key && key !== 'your-openai-api-key-here' && !key.startsWith('your-');
}

export async function sendOpenAIPrompt(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('Empty response from OpenAI API');
  }

  return text;
}
