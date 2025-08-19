interface GeminiRequest {
  systemInstruction?: {
    role?: string;
    parts: Array<{
      text: string;
    }>;
  };
  contents: Array<{
    role?: string;
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export const sendChatMessageToGemini = async (userMessage: string): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    // Build request with system instruction and user turn
    const requestBody: GeminiRequest = {
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text:
              'You are an AI assistant for InvestRight, an investment platform. Provide concise, professional answers focused on investing and financial planning. If a question is unrelated to finance, politely redirect to investment topics.'
          }
        ]
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userMessage
            }
          ]
        }
      ]
    };

    // Debug logging
    console.log('Sending request to Gemini API:', {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
      requestBody
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Try to parse error response for more details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          throw new Error(`API Error: ${errorData.error.message}`);
        }
      } catch (parseError) {
        // If we can't parse the error, use the status
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates.length > 0) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      return {
        success: true,
        message: aiResponse
      };
    } else {
      throw new Error('No response generated from Gemini API');
    }

  } catch (error) {
    console.error('Error calling Gemini API for chatbot:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};
