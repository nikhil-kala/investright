// Expert Financial Advisor Chatbot Service for InvestRight
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

// Financial advisor conversation flow as specified
const FINANCIAL_ADVISOR_FLOW = {
  welcome: "Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nI am here to help you achieve and prepare for your Key Life Goals through financial advice.",
  
  lifeGoalExplanation: "Life Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as:\n\n• Buying a house\n• Children's education\n• Marriage expenses\n• Retirement planning\n• Health & family security\n• Travel, lifestyle, or passion pursuits",
  
  startQuestion: "Are you ready to start?",
  
  nameQuestion: "What's your name? I'd love to address you personally throughout our conversation.",
  
  goalQuestion: "What inspirational life goal you have? I would love to hear from you - it could be investment advice, any goal you want to accomplish, or it could just curiosity on any investment or anything else too",
  
  disclaimer: "\n\n*This number is indicative, kindly seek guidance from Certified Financial Professional before taking a financial decision."
};

export const sendChatMessageToGemini = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('ChatbotService: Starting with userMessage:', userMessage);
    console.log('ChatbotService: Conversation history length:', conversationHistory.length);
    
    // Extract user's name from conversation history
    let userName = '';
    if (conversationHistory.length >= 3) {
      // Find the user's name from the third message (when they provided their name)
      const nameMessage = conversationHistory[2];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
      }
    }
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.log('ChatbotService: API key not configured');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }

    // Handle first message - Welcome and Life Goal Explanation
    if (conversationHistory.length === 0) {
      console.log('ChatbotService: Handling first message - welcome and explanation');
      return {
        success: true,
        message: `${FINANCIAL_ADVISOR_FLOW.welcome}\n\n${FINANCIAL_ADVISOR_FLOW.lifeGoalExplanation}\n\n${FINANCIAL_ADVISOR_FLOW.startQuestion}`
      };
    }

    // Handle second message - Check if user is ready to start
    if (conversationHistory.length === 1) {
      console.log('ChatbotService: Handling second message, user response:', userMessage);
      const userResponse = userMessage.toLowerCase();
      if (userResponse.includes('yes') || userResponse.includes('ready') || userResponse.includes('start') || userResponse.includes('ok') || userResponse.includes('sure') || userResponse.includes('go')) {
        console.log('ChatbotService: User agreed to start, asking for name');
        return {
          success: true,
          message: FINANCIAL_ADVISOR_FLOW.nameQuestion
        };
      } else {
        console.log('ChatbotService: User not ready yet');
        return {
          success: true,
          message: "I understand you might not be ready yet. Take your time! When you're ready to start, just let me know with a 'yes' or 'ready'."
        };
      }
    }

    // Handle third message - Get user's name
    if (conversationHistory.length === 2) {
      console.log('ChatbotService: Handling third message - getting name');
      const userName = userMessage.trim();
      if (userName.length > 0) {
        return {
          success: true,
          message: `Nice to meet you, ${userName}! ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
        };
      } else {
        return {
          success: true,
          message: "I didn't catch your name. Could you please tell me your name?"
        };
      }
    }

    // Handle fourth message - Get user's life goal
    if (conversationHistory.length === 3) {
      console.log('ChatbotService: Handling fourth message - getting life goal');
      const greeting = userName ? `${userName}, ` : '';
      return {
        success: true,
        message: `${greeting}${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
      };
    }

    // Handle fifth message - Get user's income
    if (conversationHistory.length === 4) {
      console.log('ChatbotService: Handling fifth message - getting income');
      const greeting = userName ? `${userName}, ` : '';
      return {
        success: true,
        message: `${greeting}That's a great goal! To provide you with the best advice, I need to understand a bit more about your financial situation. What is your current monthly income?`
      };
    }

    // Handle sixth message - Get user's risk tolerance
    if (conversationHistory.length === 5) {
      console.log('ChatbotService: Handling sixth message - getting risk tolerance');
      const greeting = userName ? `${userName}, ` : '';
      return {
        success: true,
        message: `${greeting}Thank you! Now, how would you describe your risk tolerance? Are you:\n\n1. Conservative (prefer safe, low-risk investments)\n2. Moderate (comfortable with some risk for better returns)\n3. Aggressive (willing to take higher risks for potentially higher returns)`
      };
    }

    // After 6 messages (5 questions), provide comprehensive financial advice
    if (conversationHistory.length >= 6) {
      console.log('ChatbotService: Generating comprehensive financial advice');
      return await generateFinancialAdvice(userMessage, conversationHistory);
    }

    // Default fallback
    return {
      success: true,
      message: "I'm here to help! Please continue sharing your thoughts, and I'll guide you through the process."
    };

  } catch (error) {
    console.error('Error in sendChatMessageToGemini:', error);
    return {
      success: false,
      message: 'I apologize, but I encountered an error while processing your request. Please try again.'
    };
  }
};

const generateFinancialAdvice = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    const systemInstruction = "You are an expert financial advisor specializing in Indian investment options. Based on the conversation history, provide comprehensive financial advice that includes: 1. Assessment of their goal achievability based on their current financial situation, 2. Risk appetite evaluation and recommendations, 3. Specific investment options available in India (mutual funds, stocks, FDs, PPF, NPS, etc.), 4. Income enhancement suggestions if goals are not achievable (upskilling, side business, etc.), 5. Personalized investment plan with realistic timelines, 6. Important disclaimers about seeking professional guidance. IMPORTANT RULES: - Put an asterisk (*) next to any return on investment numbers - Keep advice practical and India-specific - Use a friendly, professional, educative, and engaging tone - Address the user by their name if provided - Be realistic about goal achievability - If goals are not achievable with current income, suggest income enhancement options like: * Upskilling in their profession * Starting a side business * Starting a new business * Additional income sources - Keep the response under 400 words - Focus on actionable advice. Conversation history: " + conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') + "\n\nProvide comprehensive financial advice based on the information gathered.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemInstruction
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const advice = data.candidates[0].content.parts[0].text;
      return {
        success: true,
        message: advice + FINANCIAL_ADVISOR_FLOW.disclaimer
      };
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return {
      success: false,
      message: 'I apologize, but I encountered an error while generating your financial advice. Please try again.'
    };
  }
};

// Legacy function for backward compatibility
export const generateInvestmentPlan = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []
): Promise<{ success: boolean; message: string }> => {
  return await generateFinancialAdvice(userMessage, conversationHistory);
};
