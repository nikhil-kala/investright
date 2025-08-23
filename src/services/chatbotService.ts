// Expert Financial Advisor Chatbot Service for InvestRight
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to convert Indian number formats to numeric values
const convertIndianNumberFormat = (text: string): number | null => {
  try {
    // Remove extra spaces and convert to lowercase
    const cleanText = text.toLowerCase().replace(/\s+/g, '');
    
    // Extract numeric part and unit
    const match = cleanText.match(/^(\d+(?:\.\d+)?)(lakh|lacs|crore|crores|thousand|k|cr|l|t)?$/);
    
    if (!match) return null;
    
    const numericValue = parseFloat(match[1]);
    const unit = match[2];
    
    if (isNaN(numericValue)) return null;
    
    // Convert based on unit
    switch (unit) {
      case 'lakh':
      case 'lacs':
      case 'l':
        return numericValue * 100000; // 1 lakh = 100,000
      case 'crore':
      case 'crores':
      case 'cr':
        return numericValue * 10000000; // 1 crore = 10,000,000
      case 'thousand':
      case 'k':
      case 't':
        return numericValue * 1000; // 1 thousand = 1,000
      default:
        // If no unit specified, assume it's already in the base unit
        return numericValue;
    }
  } catch (error) {
    console.error('Error converting Indian number format:', error);
    return null;
  }
};

// Function to extract and convert financial figures from user input
const extractFinancialFigures = (userInput: string): {
  amount?: number;
  timeline?: number;
  monthlyInvestment?: number;
  income?: number;
} => {
  const result: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
  } = {};
  
  try {
    // Split input into words and process each
    const words = userInput.split(/\s+/);
    
    words.forEach((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w.]/g, '');
      
      // Check for amount patterns
      if (cleanWord.includes('lakh') || cleanWord.includes('lacs') || 
          cleanWord.includes('crore') || cleanWord.includes('crores') ||
          cleanWord.includes('thousand') || cleanWord.includes('k')) {
        const amount = convertIndianNumberFormat(word);
        if (amount && !result.amount) {
          result.amount = amount;
        }
      }
      
      // Check for timeline patterns
      if (cleanWord.includes('year') || cleanWord.includes('month')) {
        const numericMatch = word.match(/(\d+(?:\.\d+)?)/);
        if (numericMatch) {
          const value = parseFloat(numericMatch[1]);
          if (cleanWord.includes('year')) {
            result.timeline = value;
          } else if (cleanWord.includes('month')) {
            result.timeline = value / 12; // Convert months to years
          }
        }
      }
      
      // Check for monthly investment patterns
      if (cleanWord.includes('month') || cleanWord.includes('monthly')) {
        const prevWord = words[index - 1];
        if (prevWord) {
          const amount = convertIndianNumberFormat(prevWord);
          if (amount) {
            result.monthlyInvestment = amount;
          }
        }
      }
      
      // Check for income patterns
      if (cleanWord.includes('lpa') || cleanWord.includes('salary') || cleanWord.includes('income')) {
        const prevWord = words[index - 1];
        if (prevWord) {
          const amount = convertIndianNumberFormat(prevWord);
          if (amount) {
            result.income = amount;
          }
        }
      }
    });
    
    // Also check for standalone numbers that might be amounts
    if (!result.amount) {
      const standaloneNumbers = userInput.match(/(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t)/gi);
      if (standaloneNumbers) {
        const amount = convertIndianNumberFormat(standaloneNumbers[0]);
        if (amount) {
          result.amount = amount;
        }
      }
    }
    
    console.log('Extracted financial figures:', result);
    return result;
    
  } catch (error) {
    console.error('Error extracting financial figures:', error);
    return result;
  }
};

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

// Financial advisor conversation flow as specified in the system prompt
const FINANCIAL_ADVISOR_FLOW = {
  welcome: "Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.",
  
  lifeGoalExplanation: "Life Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children's education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.",
  
  startQuestion: "Are you ready to start?",
  
  nameQuestion: "What's your name? I'd love to address you personally throughout our conversation.",
  
  goalQuestion: "What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too",
  
  disclaimer: "\n\n*This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision"
};

// Updated system instruction based on user's requirements
const SYSTEM_INSTRUCTION = `You are InvestRight Bot, an expert financial advisor for Indian users. Your role is to guide users toward achieving their Key Life Goals through financial planning and unbiased investment advice.

## Communication Style
- Friendly, professional, engaging, and educative.
- Maintain a conversational flow, asking step-by-step questions.
- Use simple, easy-to-understand explanations (avoid jargon unless asked).
- Ask only essential questions to gather necessary information for investment planning.

## Conversation Flow

**Step 1: Welcome Message**
Start with:
"Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice."

Explain briefly what Life Goal Preparedness means:
"Life Goal Preparedness is about how ready and financially equipped you are to achieve goals like buying a house, children's education, marriage expenses, retirement planning, health & family security, travel, lifestyle, or passion pursuits."

Then ask:
"Are you ready to start?"

**Step 2: If User Agrees**
- Ask for their name (to address them personally).
- Ask the first question:
"What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too."

**Step 3: Goal Discovery**
- Ask follow-up questions based on their answer.
- Dig deeper into timeline, importance, and feasibility of their goal.

**Step 4: Risk Appetite & Income Source**
- Ask about their risk-taking ability (simple language: conservative, balanced, or aggressive).
- Ask about their income source & profession.
- Evaluate if their goal is achievable with current income + risk profile.

If not achievable → suggest alternative plans or modified goals.

**Step 5: Additional Guidance if Needed**
If their income or savings are insufficient, guide them on:
- Upskilling or career growth.
- Starting a side business.
- Exploring new business opportunities.

**Step 6: Investment Advice**
- Only provide investment options once the goal, risk appetite, and income are clear.
- When giving return numbers, always add "*" after the number.
- End with disclaimer:
"This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision."

## Rules
1. Keep conversation interactive (ask → listen → advise).
2. Ask only essential questions to gather key information efficiently.
3. Never directly give a plan without checking goal, risk, and income.
4. Always provide realistic guidance (don't overpromise returns).
5. Be empathetic and encouraging, but practical.`;

// Few-shot examples to guide the model's tone and structure
const FEW_SHOT_EXAMPLES = `### Few-Shot Examples

---
**Example 1: Goal Achievable**
User: I want to save for my child's education in 10 years. I think it will cost 25 lakhs.
Bot: Great! For 25 lakhs in 10 years, assuming 10%* annual returns, you need to invest about ₹13,000* per month. Since you have stable income and are comfortable with moderate risk, mutual funds (SIP) are a suitable option.
(Disclaimer: This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.)

---
**Example 2: Goal Not Achievable**
User: I want to buy a house worth 50 lakhs in 5 years, but I can only invest ₹5,000 per month.
Bot: With ₹5,000 per month and even with 12%* returns, you'll accumulate only around 4 lakhs* in 5 years. This will not be sufficient. To bridge the gap, you could either:
- Extend your timeline (e.g., 10 years instead of 5).
- Increase monthly investment.
- Explore additional income sources.
Can you share your profession and current income level? I can suggest skill upgrades or side income ideas.

---
**Example 3: Alternative Options (Profession-Based)**
User: I am a software engineer earning ₹8 LPA.
Bot: Perfect. Along with investing in SIPs, you can consider upskilling in AI/Cloud to increase salary growth. Freelancing or side projects could also boost income. These steps will make your goal achievable faster.

---
**Example 4: Lifestyle Goal**
User: I want to take a Europe trip costing 8 lakhs in 3 years.
Bot: To save 8 lakhs in 3 years, assuming 8%* returns, you need to invest around ₹20,000* per month. If that's challenging, you could:
- Plan for 4 years instead.
- Reduce target budget.
- Supplement with side income (e.g., consulting, part-time teaching, or freelancing).

---
Always end responses with:
"This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision."`;

export const sendChatMessageToGemini = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    console.log('ChatbotService: Starting with userMessage:', userMessage);
    console.log('ChatbotService: Conversation history length:', conversationHistory.length);
    console.log('ChatbotService: Full conversation history:', conversationHistory);
    
    // Extract user's name from conversation history
    let userName = '';
    if (conversationHistory.length >= 4) {
      // Find the user's name from the fourth message (index 3) when they provided their name
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
        console.log('ChatbotService: Extracted userName from position 3:', userName);
      }
    }
    
    // Also check if we can extract from the current user message for name
    if (conversationHistory.length === 2 && !userName) {
      // This is when user is providing their name
      userName = userMessage.trim();
      console.log('ChatbotService: Extracted userName from current message:', userName);
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
        console.log('ChatbotService: User provided name:', userName);
        return {
          success: true,
          message: `Nice to meet you, ${userName}! ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
        };
      } else {
        console.log('ChatbotService: User name was empty, asking again');
        return {
          success: true,
          message: "I didn't catch your name. Could you please tell me your name?"
        };
      }
    }

    // Handle fourth message - Get user's life goal
    if (conversationHistory.length === 3) {
      console.log('ChatbotService: Handling fourth message - getting life goal');
      console.log('ChatbotService: User message content:', userMessage);
      console.log('ChatbotService: Available userName:', userName);
      const greeting = userName ? `${userName}, ` : '';
      console.log('ChatbotService: Generated greeting:', greeting);
      return {
        success: true,
        message: `${greeting}${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
      };
    }

    // After goal is provided, intelligently determine what additional information is needed
    const questionCount = Math.floor((conversationHistory.length - 2) / 2);
    console.log('ChatbotService: Current state - Conversation length:', conversationHistory.length, 'Question count:', questionCount);
    
    // Extract financial figures and check what information we have
    const extractedInfo = extractFinancialFigures(userMessage);
    const hasGoal = conversationHistory.some(msg => msg.role === 'user' && msg.content.length > 10);
    const hasFinancialInfo = extractedInfo.amount || extractedInfo.timeline || extractedInfo.monthlyInvestment || extractedInfo.income;
    
    // Analyze all conversation to see if we have enough information
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const allExtracted = extractFinancialFigures(allUserMessages);
    const hasGoalInfo = conversationHistory.some(msg => msg.role === 'user' && (msg.content.includes('goal') || msg.content.includes('want') || msg.content.includes('need')));
    const hasFinancialData = allExtracted.amount || allExtracted.income || allExtracted.monthlyInvestment;
    
    console.log('ChatbotService: Information status:', { hasGoal, hasGoalInfo, hasFinancialInfo, hasFinancialData, extractedInfo, allExtracted });
    
    // Check if we should generate the investment plan
    // Conditions: Either have goal+financial data OR reached sufficient conversation length OR enough questions asked
    const shouldGeneratePlan = (hasGoalInfo && hasFinancialData) || 
                               (conversationHistory.length >= 6 && hasGoal) || 
                               questionCount >= 4;
    
    if (shouldGeneratePlan) {
      console.log('======== GENERATING INVESTMENT PLAN ========');
      console.log('ChatbotService: Plan generation triggered');
      console.log('ChatbotService: hasGoalInfo:', hasGoalInfo, 'hasFinancialData:', hasFinancialData);
      console.log('ChatbotService: conversationHistory.length:', conversationHistory.length, 'hasGoal:', hasGoal);
      console.log('ChatbotService: questionCount:', questionCount);
      console.log('ChatbotService: User message:', userMessage);
      
      try {
        const advice = await generateFinancialAdvice(userMessage, conversationHistory);
        console.log('ChatbotService: Financial advice generated successfully:', advice.success);
        console.log('ChatbotService: Advice message length:', advice.message.length);
        return {
          success: advice.success,
          message: advice.message,
          isGeneratingPlan: false
        };
      } catch (error) {
        console.error('ChatbotService: Error calling generateFinancialAdvice:', error);
        console.error('ChatbotService: Error stack:', (error as any)?.stack);
        return {
          success: true,
          message: "Based on your goal, I recommend starting with a diversified investment approach. Consider mutual funds for growth, PPF for safety, and NPS for retirement planning. Start with small amounts and increase gradually as you become more comfortable with investing." + FINANCIAL_ADVISOR_FLOW.disclaimer,
          isGeneratingPlan: false
        };
      }
    }
    
    // Continue with intelligent questions if we need more information
    if (conversationHistory.length >= 4) {
      console.log('ChatbotService: Need more information, generating intelligent follow-up question');
      return await generateRelevantQuestion(userMessage, conversationHistory);
    }

    // Default fallback
    return {
      success: true,
      message: "I'm here to help! Please continue sharing your thoughts, and I'll guide you through the process."
    };

      } catch (error) {
      console.error('Error in sendChatMessageToGemini:', error);
      console.error('Error details:', error);
      return {
        success: false,
        message: 'I apologize, but I encountered an error while processing your request. Please try again.',
        isGeneratingPlan: false
      };
    }
};

const generateRelevantQuestion = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.error('Gemini API key not configured for question generation');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }
    
    // Extract user's name for personalization
    let userName = '';
    if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Calculate which question number this is
    const questionNumber = Math.floor((conversationHistory.length - 2) / 2); // Total questions asked so far
    console.log('ChatbotService: Question number calculated:', questionNumber, 'from conversation length:', conversationHistory.length);
    console.log('ChatbotService: Question breakdown - Welcome(1) + Ready(1) + Name(1) + Goal(1) + Follow-ups:', questionNumber - 2);
    
    // Check if we have enough information to generate plan
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const allExtracted = extractFinancialFigures(allUserMessages);
    const hasGoalInfo = conversationHistory.some(msg => msg.role === 'user' && (msg.content.includes('goal') || msg.content.includes('want') || msg.content.includes('need')));
    const hasFinancialData = allExtracted.amount || allExtracted.income || allExtracted.monthlyInvestment;
    
    console.log('ChatbotService: Plan generation check:', { hasGoalInfo, hasFinancialData, questionNumber, allExtracted });
    
    if ((hasGoalInfo && hasFinancialData) || questionNumber >= 5) {
      console.log('ChatbotService: Have sufficient info or reached max questions, generating investment plan directly');
      
      // Generate the plan directly instead of using the two-step process
      try {
        const advice = await generateFinancialAdvice(_userMessage, conversationHistory);
        console.log('ChatbotService: Financial advice generated successfully in generateRelevantQuestion');
        return {
          success: advice.success,
          message: `${greeting}Perfect! I have gathered the essential information. Here's your personalized financial plan:\n\n${advice.message}`,
          isGeneratingPlan: false
        };
      } catch (error) {
        console.error('ChatbotService: Error generating plan in generateRelevantQuestion:', error);
        // Fallback to trigger message
        return {
          success: true,
          message: `${greeting}Perfect! I have gathered the essential information to create your personalized financial plan. Let me analyze your goals and create a comprehensive investment strategy for you.\n\n🔄 **Generating your personalized investment plan... Please wait.**`,
          isGeneratingPlan: true
        };
      }
    }
    
    // Intelligently determine what information is missing
    const allContent = allUserMessages.toLowerCase();
    
    console.log('ChatbotService: Analyzing conversation for missing info:', allExtracted);
    
    // Check what key information is missing
    const missingInfo = {
      timeline: !allExtracted.timeline && !allContent.includes('year') && !allContent.includes('month'),
      amount: !allExtracted.amount && !allContent.includes('lakh') && !allContent.includes('crore'),
      income: !allExtracted.income && !allContent.includes('lpa') && !allContent.includes('salary') && !allContent.includes('earn'),
      investment: !allExtracted.monthlyInvestment && !allContent.includes('invest') && !allContent.includes('save'),
      risk: !allContent.includes('risk') && !allContent.includes('conservative') && !allContent.includes('moderate') && !allContent.includes('aggressive')
    };
    
    console.log('ChatbotService: Missing information analysis:', missingInfo);
    
    // Ask the most critical missing information in a combined question
    if (missingInfo.timeline && missingInfo.amount) {
      return {
        success: true,
        message: `${greeting}Excellent goal! To create your investment strategy, I need to know:\n\n📅 **Timeline**: When do you want to achieve this goal? (e.g., 5 years, 10 years)\n💰 **Target Amount**: What's the approximate cost? (e.g., 25 lakhs, 1 crore)\n\nYou can answer both together like: "I need 50 lakhs in 8 years"`
      };
    }
    
    if (missingInfo.income && missingInfo.investment) {
      return {
        success: true,
        message: `${greeting}Now I need to understand your financial capacity:\n\n💼 **Monthly Income**: What do you currently earn? (e.g., 8 LPA, 60,000 per month)\n📈 **Investment Capacity**: How much can you invest monthly towards this goal? (e.g., 15,000 per month)\n\nYou can combine like: "I earn 10 LPA and can invest 20,000 monthly"`
      };
    }
    
    if (missingInfo.risk) {
      return {
        success: true,
        message: `${greeting}Almost done! What's your investment risk preference?\n\n🛡️ **Conservative**: Safe investments, lower returns (FD, PPF)\n⚖️ **Moderate**: Balanced mix, moderate returns (Mutual Funds)\n🚀 **Aggressive**: Higher risk, higher potential returns (Equity, Stocks)\n\nJust say "moderate" or describe your preference.`
      };
    }
    
    // If we have most info, ask for any remaining details
    if (questionNumber >= 3) {
      return {
        success: true,
        message: `${greeting}Great! Any additional details about your current financial situation, age, or family responsibilities that might affect your investment planning?`
      };
    }
    
    // Use Google Generative AI for dynamic question generation
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro"
      });

      const chat = model.startChat();
      
      const prompt = `${SYSTEM_INSTRUCTION}

${FEW_SHOT_EXAMPLES}

Based on the conversation history below, generate the next relevant follow-up question to better understand the user's financial situation and goals efficiently. 

User's name: ${userName}
Current question number: ${questionNumber}

Conversation so far:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate ONE specific, relevant question that gathers essential information for investment planning:`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const question = response.text().trim();
      
      console.log('Generated relevant question using Google AI successfully');
      return {
        success: true,
        message: question
      };
    } catch (aiError) {
      console.error('Error using Google AI for question generation:', aiError);
      // Fall through to fallback questions
    }
    
    // Simple fallback question
    const fallbackQuestion = `${greeting}Could you share more details about your goal, timeline, budget, or current financial situation? Any information helps me create a better plan for you.`;
    
    return {
      success: true,
      message: fallbackQuestion
    };
  } catch (error) {
    console.error('Error in generateRelevantQuestion:', error);
    
    // Provide fallback questions based on conversation length
    const questionNumber = Math.floor((conversationHistory.length - 4) / 2) + 2;
    const greeting = conversationHistory.length >= 4 ? `${conversationHistory[3].content}, ` : '';
    
    const fallbackQuestions = [
      `${greeting}What is your target timeline for achieving this goal?`,
      `${greeting}What is your current monthly income and how much can you allocate for investments?`,
      `${greeting}How would you describe your risk tolerance - conservative, moderate, or aggressive?`,
      `${greeting}What is your current profession and main sources of income?`,
      `${greeting}Do you have any existing savings, investments, or assets?`,
      `${greeting}What is your current age and do you have any financial dependents?`
    ];
    
    const fallbackQuestion = fallbackQuestions[questionNumber - 2] || `${greeting}Could you tell me more about your financial background?`;
    
    return {
      success: true,
      message: fallbackQuestion
    };
  }
};

const generateFinancialAdvice = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.error('Gemini API key not configured');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }
    
    // Extract user's name for personalization
    let userName = '';
    if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
        console.log('generateFinancialAdvice: Extracted userName:', userName);
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Extract key information from conversation for personalized fallback
    let goalDescription = '';
    let timeline = '';
    let cost = '';
    // let income = ''; // Not used in current implementation
    let riskAppetite = '';
    let extractedFigures: {
      amount?: number;
      timeline?: number;
      monthlyInvestment?: number;
      income?: number;
    } = {};
    
    // Parse conversation to extract key details and financial figures
    conversationHistory.forEach((msg, index) => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        
        // Extract goal description - look for the first substantive user message (not just name)
        if (!goalDescription && msg.content.length > 5 && !msg.content.toLowerCase().includes('yes') && !msg.content.toLowerCase().includes('ready')) {
          // Skip if this looks like a name (short and doesn't contain goal keywords)
          if (msg.content.length > 15 || content.includes('goal') || content.includes('want') || content.includes('need') || content.includes('save') || content.includes('buy')) {
            goalDescription = msg.content;
          }
        }
        
        if (content.includes('year') || content.includes('month')) {
          timeline = msg.content;
        } else if (content.includes('₹') || content.includes('lakh') || content.includes('crore') || content.includes('thousand')) {
          cost = msg.content;
        } else if (content.includes('income') || content.includes('salary') || content.includes('lpa')) {
          // Store income information (not used in current fallback implementation)
        } else if (content.includes('conservative') || content.includes('moderate') || content.includes('aggressive')) {
          riskAppetite = msg.content;
        }
        
        // Extract financial figures from user messages
        const figures = extractFinancialFigures(msg.content);
        if (figures.amount && !extractedFigures.amount) extractedFigures.amount = figures.amount;
        if (figures.timeline && !extractedFigures.timeline) extractedFigures.timeline = figures.timeline;
        if (figures.monthlyInvestment && !extractedFigures.monthlyInvestment) extractedFigures.monthlyInvestment = figures.monthlyInvestment;
        if (figures.income && !extractedFigures.income) extractedFigures.income = figures.income;
      }
    });
    
    console.log('Extracted financial figures from conversation:', extractedFigures);
    
    // Use Google Generative AI for comprehensive financial advice
    try {
      console.log('======== GOOGLE AI GENERATION START ========');
      console.log('generateFinancialAdvice: Starting Google AI call...');
      console.log('generateFinancialAdvice: API Key configured:', !!apiKey);
      console.log('generateFinancialAdvice: Extracted figures for prompt:', extractedFigures);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro"
      });

      const chat = model.startChat();
      
      const prompt = `${SYSTEM_INSTRUCTION}

${FEW_SHOT_EXAMPLES}

Based on this comprehensive conversation (7 questions asked), provide a detailed financial plan including:

**User Profile Summary:**
• **Name**: ${userName || 'User'}
• **Goal**: ${goalDescription || 'Financial goal'}
• **Risk Appetite**: ${riskAppetite || 'To be determined'}

**Extracted Financial Figures:**
${extractedFigures.amount ? `• Goal Amount: ₹${(extractedFigures.amount / 100000).toFixed(1)} lakhs (${extractedFigures.amount.toLocaleString()})` : ''}
${extractedFigures.timeline ? `• Timeline: ${extractedFigures.timeline} years` : ''}
${extractedFigures.monthlyInvestment ? `• Monthly Investment Capacity: ₹${(extractedFigures.monthlyInvestment / 1000).toFixed(1)}k (${extractedFigures.monthlyInvestment.toLocaleString()})` : ''}
${extractedFigures.income ? `• Annual Income: ₹${(extractedFigures.income / 100000).toFixed(1)} lakhs (${extractedFigures.income.toLocaleString()})` : ''}

**Complete User Inputs from Conversation:**
${conversationHistory.map((msg, index) => {
  if (msg.role === 'user') {
    return `• Question ${Math.floor(index/2) + 1}: ${msg.content}`;
  }
  return null;
}).filter(Boolean).join('\n')}

**Financial Plan Requirements:**

1. **Goal Cost Analysis**: 
   - Use the exact goal amount provided: ${extractedFigures.amount ? `₹${(extractedFigures.amount / 100000).toFixed(1)} lakhs` : 'To be determined'}
   - If user didn't provide cost, research and provide estimated cost for their specific goal
   - Break down the total cost into components if applicable

2. **Feasibility Assessment**: 
   - Calculate if the goal is achievable with their current financial capacity
   - Use the exact figures: Timeline: ${extractedFigures.timeline || 'TBD'} years, Monthly Investment: ${extractedFigures.monthlyInvestment ? `₹${(extractedFigures.monthlyInvestment / 1000).toFixed(1)}k` : 'TBD'}
   - Consider inflation (6%*), market returns (10-12%*), and realistic investment growth
   - Provide concrete calculations showing monthly investment needed vs. capacity

3. **Investment Strategy**: 
   - Specific investment recommendations for India (mutual funds, stocks, FDs, PPF, NPS, ELSS)
   - Monthly investment allocation strategy based on their capacity
   - Risk assessment and portfolio diversification considering their risk appetite: ${riskAppetite || 'To be assessed'}

4. **Alternative Options** (if goal is not achievable):
   - Suggest modified goal parameters (extended timeline, reduced scope)
   - Income enhancement strategies (upskilling, side business, career advancement)
   - Skill development recommendations based on their profession
   - Alternative investment approaches

5. **Action Plan**: 
   - Step-by-step implementation with timelines
   - Monthly investment amounts (use exact figures provided)
   - Progress tracking milestones
   - Specific mutual fund recommendations for India

**Calculation Requirements:**
- Use exact figures: Goal: ${extractedFigures.amount ? `₹${extractedFigures.amount.toLocaleString()}` : 'TBD'}, Timeline: ${extractedFigures.timeline || 'TBD'} years
- Calculate required monthly investment: ${extractedFigures.amount && extractedFigures.timeline ? `₹${Math.round(extractedFigures.amount / (extractedFigures.timeline * 12)).toLocaleString()}` : 'To be calculated'}
- Compare with their capacity: ${extractedFigures.monthlyInvestment ? `₹${extractedFigures.monthlyInvestment.toLocaleString()}` : 'To be determined'}
- Show feasibility gap and solutions

Rules:
- Mark all ROI numbers with asterisk (*)
- Keep advice India-specific and practical
- Use friendly, professional tone
- Address user by name: ${greeting}
- Be realistic about goal achievability
- Provide concrete financial calculations using the exact figures provided
- If goal seems unachievable, offer constructive alternatives
- Generate a comprehensive investment report
- Keep response under 500 words
- Use the extracted financial figures for all calculations

**Complete Conversation History:**
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate a comprehensive financial plan with goal cost analysis, feasibility assessment, and investment strategy using ALL the user inputs provided above:`;

      console.log('generateFinancialAdvice: Sending request to Google AI with prompt length:', prompt.length);
      console.log('generateFinancialAdvice: Conversation history length:', conversationHistory.length);
      console.log('generateFinancialAdvice: Extracted figures being sent to Gemini:', extractedFigures);
      console.log('generateFinancialAdvice: User profile being sent to Gemini:', { userName, goalDescription, riskAppetite });
      console.log('generateFinancialAdvice: First 500 characters of prompt:', prompt.substring(0, 500));
      
      console.log('generateFinancialAdvice: Calling Gemini API...');
      const result = await chat.sendMessage(prompt);
      console.log('generateFinancialAdvice: Gemini API call completed, processing response...');
      
      const response = await result.response;
      const advice = response.text().trim();
      
      console.log('======== GOOGLE AI GENERATION RESPONSE ========');
      console.log('generateFinancialAdvice: Generated financial advice using Google AI, length:', advice.length);
      console.log('generateFinancialAdvice: First 200 characters of advice:', advice.substring(0, 200));
      console.log('generateFinancialAdvice: Last 200 characters of advice:', advice.substring(advice.length - 200));
      
      // Check if the advice is empty or too short
      if (!advice || advice.length < 50) {
        console.log('======== GOOGLE AI RETURNED EMPTY/SHORT RESPONSE ========');
        console.log('generateFinancialAdvice: Advice is empty or too short, falling back to fallback advice');
        console.log('generateFinancialAdvice: Advice content:', JSON.stringify(advice));
        throw new Error('Empty or insufficient response from Gemini API');
      }
      
      console.log('======== GOOGLE AI GENERATION SUCCESS ========');
      return {
        success: true,
        message: advice + FINANCIAL_ADVISOR_FLOW.disclaimer
      };
    } catch (aiError) {
      console.error('======== GOOGLE AI GENERATION ERROR ========');
      console.error('generateFinancialAdvice: Error using Google AI for financial advice:', aiError);
      console.error('generateFinancialAdvice: Error message:', (aiError as any)?.message || 'Unknown error');
      console.error('generateFinancialAdvice: Error details:', JSON.stringify(aiError, null, 2));
      console.error('generateFinancialAdvice: Error stack:', (aiError as any)?.stack);
      // Fall through to fallback advice
    }
    
    // Provide fallback advice if Google AI fails
    console.log('======== USING FALLBACK ADVICE ========');
    console.log('generateFinancialAdvice: Using fallback advice due to Google AI failure');
    console.log('generateFinancialAdvice: Extracted info for fallback:', { goalDescription, timeline, cost, riskAppetite, extractedFigures });
    
    // Create a more comprehensive fallback advice
    const allConversationText = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const comprehensiveExtracted = extractFinancialFigures(allConversationText);
    
    console.log('generateFinancialAdvice: Comprehensive extracted for fallback:', comprehensiveExtracted);
    console.log('generateFinancialAdvice: All conversation text:', allConversationText);
    
    const fallbackAdvice = `${greeting}Based on our conversation, here's your personalized investment strategy:

## 🎯 **Your Financial Goal Analysis**
**Goal**: ${goalDescription || 'Achieving your financial objective'}
**Timeline**: ${comprehensiveExtracted.timeline ? `${comprehensiveExtracted.timeline} years` : timeline || 'As discussed'}
**Target Amount**: ${comprehensiveExtracted.amount ? `₹${(comprehensiveExtracted.amount / 100000).toFixed(1)} lakhs` : cost || 'Based on your requirements'}

## 📊 **Investment Strategy**

**Monthly Investment Approach:**
${comprehensiveExtracted.monthlyInvestment ? 
`• **Your Capacity**: ₹${(comprehensiveExtracted.monthlyInvestment / 1000).toFixed(1)}k per month
• **Recommended Allocation**: Start with 80% of your capacity (₹${Math.round(comprehensiveExtracted.monthlyInvestment * 0.8 / 1000)}k)
• **Growth Plan**: Increase by 10-15% annually` :
`• **Start Small**: Begin with ₹10,000-15,000 monthly
• **Scale Up**: Increase as income grows
• **Rule of Thumb**: Invest 20-30% of monthly income`}

**Portfolio Allocation for India:**
📈 **Equity Mutual Funds (60%)**: Large-cap, Mid-cap, Flexi-cap funds
🛡️ **Debt Instruments (30%)**: PPF, ELSS, Debt funds
💰 **Emergency Fund (10%)**: Liquid funds, FD for 6-month expenses

## 🕰️ **Timeline & Returns**
${comprehensiveExtracted.amount && comprehensiveExtracted.timeline ?
`**Target**: ₹${(comprehensiveExtracted.amount / 100000).toFixed(1)} lakhs in ${comprehensiveExtracted.timeline} years
**Required Monthly SIP**: ₹${Math.round(comprehensiveExtracted.amount / (comprehensiveExtracted.timeline * 12 * 1.1))} (at 10%* returns)
**Expected Corpus**: ₹${(comprehensiveExtracted.amount / 100000).toFixed(1)} lakhs*` :
`**Conservative Returns**: 8-10%* annually
**Moderate Returns**: 10-12%* annually  
**Aggressive Returns**: 12-15%* annually`}

## ✅ **Action Plan**
1. **Complete KYC** with any mutual fund company
2. **Start SIP** in diversified equity funds
3. **Open PPF Account** for tax savings
4. **Set up Emergency Fund** in liquid funds
5. **Review Quarterly** and rebalance portfolio

## 📝 **Tax Saving Options**
• **ELSS Funds**: Save up to ₹1.5 lakhs under 80C
• **PPF**: ₹1.5 lakhs annual limit, 15-year lock-in
• **ULIPs**: Insurance + investment combo

${comprehensiveExtracted.income ? 
`## 💼 **Income-Based Recommendations**
With ₹${(comprehensiveExtracted.income / 100000).toFixed(1)} lakhs annual income:
• Emergency Fund: ₹${Math.round(comprehensiveExtracted.income * 0.5 / 100000)} lakhs
• Monthly Investment: ₹${Math.round(comprehensiveExtracted.income * 0.25 / 12000)}k-${Math.round(comprehensiveExtracted.income * 0.35 / 12000)}k
• Insurance: Term plan of ₹${Math.round(comprehensiveExtracted.income * 10 / 100000)} lakhs` : ''}

**Remember**: Start small, stay consistent, and increase gradually. Time in the market beats timing the market!

*All returns are indicative and historical. Markets are subject to risks.`;

    console.log('generateFinancialAdvice: Fallback advice generated, length:', fallbackAdvice.length);
    console.log('generateFinancialAdvice: First 300 characters of fallback:', fallbackAdvice.substring(0, 300));
    console.log('generateFinancialAdvice: Last 200 characters of fallback:', fallbackAdvice.substring(fallbackAdvice.length - 200));

    return {
      success: true,
      message: fallbackAdvice + FINANCIAL_ADVISOR_FLOW.disclaimer
    };
  } catch (error) {
    console.error('Error in generateFinancialAdvice:', error);
    
    // Provide a simple fallback response for unexpected errors
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

// Temporary function to store user inputs from chat conversation
export const storeUserInputsTemporarily = (conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): {
  userName: string;
  goalDescription: string;
  timeline: string;
  cost: string;
  income: string;
  riskAppetite: string;
  profession: string;
  extractedFigures: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
  };
  userInputs: Array<{ question: string; answer: string }>;
} => {
  console.log('storeUserInputsTemporarily: Processing conversation history...');
  
  // Initialize variables
  let userName = '';
  let goalDescription = '';
  let timeline = '';
  let cost = '';
  let income = '';
  let riskAppetite = '';
  let profession = '';
  let extractedFigures: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
  } = {};
  
  // Extract user inputs from conversation
  const userInputs: Array<{ question: string; answer: string }> = [];
  
  conversationHistory.forEach((msg, index) => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();
      
      // Extract specific information based on question position
      if (index === 3 && !userName) { // Name question (usually 4th message)
        userName = msg.content.trim();
        userInputs.push({ question: 'What is your name?', answer: msg.content });
      } else if (index === 5 && !goalDescription) { // Goal question (usually 6th message)
        goalDescription = msg.content;
        userInputs.push({ question: 'What is your life goal?', answer: msg.content });
      } else if (content.includes('year') || content.includes('month') || content.includes('timeline')) {
        timeline = msg.content;
        userInputs.push({ question: 'What is your timeline?', answer: msg.content });
      } else if (content.includes('₹') || content.includes('lakh') || content.includes('crore') || content.includes('thousand') || content.includes('cost')) {
        cost = msg.content;
        userInputs.push({ question: 'What is the cost of your goal?', answer: msg.content });
      } else if (content.includes('income') || content.includes('salary') || content.includes('lpa') || content.includes('earn')) {
        income = msg.content;
        userInputs.push({ question: 'What is your income?', answer: msg.content });
      } else if (content.includes('conservative') || content.includes('moderate') || content.includes('aggressive') || content.includes('risk')) {
        riskAppetite = msg.content;
        userInputs.push({ question: 'What is your risk appetite?', answer: msg.content });
      } else if (content.includes('engineer') || content.includes('doctor') || content.includes('teacher') || content.includes('business') || content.includes('profession')) {
        profession = msg.content;
        userInputs.push({ question: 'What is your profession?', answer: msg.content });
      } else {
        // Generic question for other user inputs
        userInputs.push({ question: `Question ${Math.floor(index/2) + 1}`, answer: msg.content });
      }
      
      // Extract financial figures from user messages
      const figures = extractFinancialFigures(msg.content);
      if (figures.amount && !extractedFigures.amount) extractedFigures.amount = figures.amount;
      if (figures.timeline && !extractedFigures.timeline) extractedFigures.timeline = figures.timeline;
      if (figures.monthlyInvestment && !extractedFigures.monthlyInvestment) extractedFigures.monthlyInvestment = figures.monthlyInvestment;
      if (figures.income && !extractedFigures.income) extractedFigures.income = figures.income;
    }
  });
  
  console.log('storeUserInputsTemporarily: Extracted user inputs:', {
    userName,
    goalDescription,
    timeline,
    cost,
    income,
    riskAppetite,
    profession,
    extractedFigures,
    userInputsCount: userInputs.length
  });
  
  return {
    userName,
    goalDescription,
    timeline,
    cost,
    income,
    riskAppetite,
    profession,
    extractedFigures,
    userInputs
  };
};

// Enhanced function to send stored inputs to Gemini API
export const sendStoredInputsToGemini = async (
  storedInputs: ReturnType<typeof storeUserInputsTemporarily>
): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.error('Gemini API key not configured');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }
    
    console.log('sendStoredInputsToGemini: Starting Gemini API call with stored inputs...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro"
    });

    const chat = model.startChat();
    
    const greeting = storedInputs.userName ? `${storedInputs.userName}, ` : '';
    
    const prompt = `${SYSTEM_INSTRUCTION}

${FEW_SHOT_EXAMPLES}

Based on the stored user inputs, provide a detailed financial plan including:

**User Profile Summary:**
• **Name**: ${storedInputs.userName || 'User'}
• **Goal**: ${storedInputs.goalDescription || 'Financial goal'}
• **Risk Appetite**: ${storedInputs.riskAppetite || 'To be determined'}
• **Profession**: ${storedInputs.profession || 'To be determined'}

**Stored Financial Figures:**
${storedInputs.extractedFigures.amount ? `• Goal Amount: ₹${(storedInputs.extractedFigures.amount / 100000).toFixed(1)} lakhs (${storedInputs.extractedFigures.amount.toLocaleString()})` : ''}
${storedInputs.extractedFigures.timeline ? `• Timeline: ${storedInputs.extractedFigures.timeline} years` : ''}
${storedInputs.extractedFigures.monthlyInvestment ? `• Monthly Investment Capacity: ₹${(storedInputs.extractedFigures.monthlyInvestment / 1000).toFixed(1)}k (${storedInputs.extractedFigures.monthlyInvestment.toLocaleString()})` : ''}
${storedInputs.extractedFigures.income ? `• Annual Income: ₹${(storedInputs.extractedFigures.income / 100000).toFixed(1)} lakhs (${storedInputs.extractedFigures.income.toLocaleString()})` : ''}

**Stored User Inputs:**
${storedInputs.userInputs.map((input, index) => `• ${input.question}: ${input.answer}`).join('\n')}

**Financial Plan Requirements:**

1. **Goal Cost Analysis**: 
   - Use the exact goal amount provided: ${storedInputs.extractedFigures.amount ? `₹${(storedInputs.extractedFigures.amount / 100000).toFixed(1)} lakhs` : 'To be determined'}
   - If user didn't provide cost, research and provide estimated cost for their specific goal
   - Break down the total cost into components if applicable

2. **Feasibility Assessment**: 
   - Calculate if the goal is achievable with their current financial capacity
   - Use the exact figures: Timeline: ${storedInputs.extractedFigures.timeline || 'TBD'} years, Monthly Investment: ${storedInputs.extractedFigures.monthlyInvestment ? `₹${(storedInputs.extractedFigures.monthlyInvestment / 1000).toFixed(1)}k` : 'TBD'}
   - Consider inflation (6%*), market returns (10-12%*), and realistic investment growth
   - Provide concrete calculations showing monthly investment needed vs. capacity

3. **Investment Strategy**: 
   - Specific investment recommendations for India (mutual funds, stocks, FDs, PPF, NPS, ELSS)
   - Monthly investment allocation strategy based on their capacity
   - Risk assessment and portfolio diversification considering their risk appetite: ${storedInputs.riskAppetite || 'To be assessed'}

4. **Alternative Options** (if goal is not achievable):
   - Suggest modified goal parameters (extended timeline, reduced scope)
   - Income enhancement strategies (upskilling, side business, career advancement)
   - Skill development recommendations based on their profession: ${storedInputs.profession || 'To be determined'}
   - Alternative investment approaches

5. **Action Plan**: 
   - Step-by-step implementation with timelines
   - Monthly investment amounts (use exact figures provided)
   - Progress tracking milestones
   - Specific mutual fund recommendations for India

**Calculation Requirements:**
- Use exact figures: Goal: ${storedInputs.extractedFigures.amount ? `₹${storedInputs.extractedFigures.amount.toLocaleString()}` : 'TBD'}, Timeline: ${storedInputs.extractedFigures.timeline || 'TBD'} years
- Calculate required monthly investment: ${storedInputs.extractedFigures.amount && storedInputs.extractedFigures.timeline ? `₹${Math.round(storedInputs.extractedFigures.amount / (storedInputs.extractedFigures.timeline * 12)).toLocaleString()}` : 'To be calculated'}
- Compare with their capacity: ${storedInputs.extractedFigures.monthlyInvestment ? `₹${storedInputs.extractedFigures.monthlyInvestment.toLocaleString()}` : 'To be determined'}
- Show feasibility gap and solutions

Rules:
- Mark all ROI numbers with asterisk (*)
- Keep advice India-specific and practical
- Use friendly, professional tone
- Address user by name: ${greeting}
- Be realistic about goal achievability
- Provide concrete financial calculations using the exact figures provided
- If goal seems unachievable, offer constructive alternatives
- Generate a comprehensive investment report
- Keep response under 500 words
- Use the stored financial figures for all calculations

Generate a comprehensive financial plan with goal cost analysis, feasibility assessment, and investment strategy using ALL the stored user inputs provided above:`;

    console.log('sendStoredInputsToGemini: Sending request to Gemini with prompt length:', prompt.length);
    console.log('sendStoredInputsToGemini: Stored inputs being sent:', storedInputs);
    
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const advice = response.text().trim();
    
    console.log('sendStoredInputsToGemini: Generated financial advice successfully, length:', advice.length);
    
    return {
      success: true,
      message: advice + FINANCIAL_ADVISOR_FLOW.disclaimer
    };
    
  } catch (error) {
    console.error('Error in sendStoredInputsToGemini:', error);
    return {
      success: false,
      message: 'I apologize, but I encountered an error while generating your financial advice. Please try again.'
    };
  }
};

// Test function to verify financial advice generation
export const testFinancialAdviceGeneration = async (): Promise<{ success: boolean; message: string }> => {
  const testConversation = [
    { role: 'assistant' as const, content: 'Welcome to InvestRight!' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name?' },
    { role: 'user' as const, content: 'John' },
    { role: 'assistant' as const, content: 'What is your life goal?' },
    { role: 'user' as const, content: 'I want to save for my child education in 10 years' },
    { role: 'assistant' as const, content: 'What is the timeline and cost?' },
    { role: 'user' as const, content: '10 years, around 25 lakhs' },
    { role: 'assistant' as const, content: 'What is your monthly income?' },
    { role: 'user' as const, content: 'I earn 50,000 per month' },
    { role: 'assistant' as const, content: 'What is your risk appetite?' },
    { role: 'user' as const, content: 'Moderate' },
    { role: 'assistant' as const, content: 'What is your profession?' },
    { role: 'user' as const, content: 'Software Engineer' },
    { role: 'assistant' as const, content: 'Do you have existing investments?' },
    { role: 'user' as const, content: 'Some FDs and savings' },
    { role: 'assistant' as const, content: 'What is your age and dependents?' },
    { role: 'user' as const, content: '35 years old, 1 child' }
  ];
  
  console.log('Testing financial advice generation with sample conversation...');
  return await generateFinancialAdvice('Generate my financial plan', testConversation);
};

// Test function to verify Indian number conversion
export const testIndianNumberConversion = (): void => {
  const testCases = [
    '50 lakhs',
    '2.5 crores',
    '10k per month',
    '8 LPA',
    '25 lakh',
    '1 crore',
    '5000 monthly',
    '15 thousand'
  ];
  
  console.log('Testing Indian number conversion:');
  testCases.forEach(testCase => {
    const result = convertIndianNumberFormat(testCase);
    console.log(`"${testCase}" → ${result}`);
  });
  
  console.log('\nTesting financial figure extraction:');
  const testInput = 'I want to save 25 lakhs in 10 years and can invest 10k per month. I earn 8 LPA.';
  const extracted = extractFinancialFigures(testInput);
  console.log(`Input: "${testInput}"`);
  console.log('Extracted:', extracted);
};