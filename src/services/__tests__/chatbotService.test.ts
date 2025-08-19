import { sendChatMessageToGemini } from '../chatbotService';

// Mock fetch globally
global.fetch = jest.fn();

describe('Chatbot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete import.meta.env.VITE_GEMINI_API_KEY;
  });

  it('should return error when API key is missing', async () => {
    const result = await sendChatMessageToGemini('Hello, how can you help me with investing?');

    expect(result.success).toBe(false);
    expect(result.message).toContain('API key not found');
  });

  it('should handle successful chat response', async () => {
    // Mock environment variable
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: 'I can help you with various investment strategies and financial planning questions. What specific area would you like to learn about?' }]
          }
        }]
      })
    });

    const result = await sendChatMessageToGemini('Hello, how can you help me with investing?');

    expect(result.success).toBe(true);
    expect(result.message).toContain('investment strategies');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('should include user message in the prompt', async () => {
    // Mock environment variable
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: 'Test response' }]
          }
        }]
      })
    });

    const userMessage = 'What is compound interest?';
    await sendChatMessageToGemini(userMessage);

    // Check that the fetch was called with the user message in the request body
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.contents[0].parts[0].text).toContain(userMessage);
  });

  it('should handle API errors', async () => {
    // Mock environment variable
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';

    // Mock error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: { message: 'API quota exceeded' }
      })
    });

    const result = await sendChatMessageToGemini('Hello');

    expect(result.success).toBe(false);
    expect(result.message).toBe('API quota exceeded');
  });

  it('should handle network errors', async () => {
    // Mock environment variable
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';

    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await sendChatMessageToGemini('Hello');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error');
  });

  it('should handle HTTP errors', async () => {
    // Mock environment variable
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';

    // Mock HTTP error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429
    });

    const result = await sendChatMessageToGemini('Hello');

    expect(result.success).toBe(false);
    expect(result.message).toContain('HTTP error! status: 429');
  });
});
