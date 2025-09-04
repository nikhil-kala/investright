// Expert Financial Advisor Chatbot Service for InvestRight
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to format questions with sample answer formats
const formatQuestionWithSamples = (question: string, questionType: string): string => {
  const sampleFormats: { [key: string]: string[] } = {
    timeline: [
      '• "5 years" or "10 years"',
      '• "I want to buy a house in 3 years"',
      '• "My child will start college in 8 years"'
    ],
    amount: [
      '• "50 lakhs" or "1 crore"',
      '• "Around ₹75 lakhs in my city"',
      '• "Between 60-80 lakhs depending on location"'
    ],
    income: [
      '• "₹50,000 per month, can invest ₹20,000"',
      '• "I earn ₹8 LPA, can save ₹30,000 monthly"',
      '• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"'
    ],
    risk_appetite: [
      '• "Conservative - I prefer safe investments"',
      '• "Balanced - mix of safe and growth"',
      '• "Aggressive - I can take higher risks for better returns"'
    ],
    profession: [
      '• "Software Engineer"',
      '• "Business Owner"',
      '• "Government Employee"'
    ],
    goal: [
      '• "Buy a house worth ₹1 crore"',
      '• "Save for child\'s education"',
      '• "Plan for retirement"'
    ]
  };

  const samples = sampleFormats[questionType] || [];
  if (samples.length === 0) return question;

  return `${question}

Sample format:
${samples.join('\n')}`;
};

// Function to determine current step in the conversation
const determineCurrentStep = (conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>, extracted: any): string => {
  const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ').toLowerCase();
  
  // Step 3.1: Goal, Amount & Timeline Collection
  if (!extracted.amount || !extracted.timeline) {
    return 'goal_amount_timeline';
  }
  
  // Step 3.2: Income Source & Monthly Savings Assessment
  if (!extracted.income || !extracted.monthlyInvestment) {
    return 'income_savings';
  }
  
  // Step 3.3: Existing Savings & Assets Check
  if (!extracted.existingSavings && !allUserMessages.includes('existing') && !allUserMessages.includes('savings') && !allUserMessages.includes('investment') && !allUserMessages.includes('asset')) {
    return 'existing_savings';
  }
  
  // Step 3.4: Goal Feasibility Analysis
  if (extracted.amount && extracted.timeline && extracted.income && extracted.monthlyInvestment) {
    return 'feasibility_analysis';
  }
  
  // Default to income assessment if we have goal but not income
  return 'income_savings';
};

// Function to generate step-based questions
const generateStepBasedQuestion = async (
  currentStep: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  extracted: any,
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    const userName = userInfo?.username || '';
    const greeting = userName ? `${userName}, ` : '';
    
    switch (currentStep) {
      case 'goal_amount_timeline':
        if (!extracted.amount) {
          return {
            success: true,
            message: `${greeting}What is the target amount for your goal? If you're not sure about the cost, I can help you research current market prices.

Sample format:
• "50 lakhs" or "1 crore"
• "Around ₹75 lakhs in my city"
• "Between 60-80 lakhs depending on location"
• "I'm not sure about the cost"`

          };
        }
        if (!extracted.timeline) {
          return {
            success: true,
            message: `${greeting}What is your target timeline for achieving this goal?

Sample format:
• "5 years" or "10 years"
• "I want to buy a house in 3 years"
• "My child will start college in 8 years"`

          };
        }
        // If we have both amount and timeline, move to next step
        return generateStepBasedQuestion('income_savings', conversationHistory, extracted, userInfo);
        
      case 'income_savings':
        return {
          success: true,
          message: `${greeting}What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"`

        };
        
      case 'existing_savings':
        return {
          success: true,
          message: `${greeting}Do you have any existing savings or investments that we can consider for this goal?

Sample format:
• "I have ₹2 lakhs in FDs"
• "₹5 lakhs in mutual funds already"
• "No existing savings, starting fresh"`

        };
        
      case 'feasibility_analysis':
        // Perform feasibility analysis and provide results
        return await performFeasibilityAnalysis(conversationHistory, extracted, userInfo);
        
      default:
        return {
          success: true,
          message: `${greeting}Could you share more details about your financial situation?`
        };
    }
  } catch (error) {
    console.error('Error in generateStepBasedQuestion:', error);
    return {
      success: true,
      message: `${greeting}Could you tell me more about your financial goals?`
    };
  }
};

// Function to perform feasibility analysis
const performFeasibilityAnalysis = async (
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  extracted: any,
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    const userName = userInfo?.username || '';
    const greeting = userName ? `${userName}, ` : '';
    
    // Extract key information
    const goalAmount = extracted.amount || 0;
    const timeline = extracted.timeline || 0;
    const monthlyInvestment = extracted.monthlyInvestment || 0;
    const existingSavings = extracted.existingSavings || 0;
    
    // Calculate feasibility
    const annualReturn = 0.10; // 10% annual return
    const monthlyReturn = annualReturn / 12;
    const totalMonths = timeline * 12;
    
    // Future value of existing savings
    const futureValueExisting = existingSavings * Math.pow(1 + annualReturn, timeline);
    
    // Future value of monthly investments (SIP)
    const futureValueSIP = monthlyInvestment * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);
    
    const totalAccumulation = futureValueExisting + futureValueSIP;
    const shortfall = goalAmount - totalAccumulation;
    
    if (totalAccumulation >= goalAmount) {
      // Goal is achievable
      const surplus = totalAccumulation - goalAmount;
      return {
        success: true,
        message: `${greeting}Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹${(existingSavings / 100000).toFixed(1)} lakhs
• Monthly Investment: ₹${(monthlyInvestment / 1000).toFixed(1)}k
• Timeline: ${timeline} years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹${(existingSavings / 100000).toFixed(1)} lakhs in ${timeline} years: ₹${(futureValueExisting / 100000).toFixed(1)} lakhs*
• Future Value of ₹${(monthlyInvestment / 1000).toFixed(1)}k monthly SIP: ₹${(futureValueSIP / 100000).toFixed(1)} lakhs*
• **Total Accumulation: ₹${(totalAccumulation / 100000).toFixed(1)} lakhs***

**Result: ✅ GOAL IS ACHIEVABLE!** You'll have ₹${(surplus / 100000).toFixed(1)} lakhs* more than needed.

Let me create your personalized investment plan...`,
        isGeneratingPlan: true
      };
    } else {
      // Goal is not achievable
      return {
        success: true,
        message: `${greeting}Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹${(existingSavings / 100000).toFixed(1)} lakhs
• Monthly Investment: ₹${(monthlyInvestment / 1000).toFixed(1)}k
• Timeline: ${timeline} years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹${(existingSavings / 100000).toFixed(1)} lakhs in ${timeline} years: ₹${(futureValueExisting / 100000).toFixed(1)} lakhs*
• Future Value of ₹${(monthlyInvestment / 1000).toFixed(1)}k monthly SIP: ₹${(futureValueSIP / 100000).toFixed(1)} lakhs*
• **Total Accumulation: ₹${(totalAccumulation / 100000).toFixed(1)} lakhs***

**Result: ❌ GOAL IS NOT ACHIEVABLE** - You'll be short by ₹${(shortfall / 100000).toFixed(1)} lakhs*

Since your current capacity won't achieve this goal, let me suggest alternatives:

**What is your profession?** This will help me provide targeted advice.

Sample format:
• "Software Engineer"
• "Business Owner"
• "Government Employee"`

      };
    }
  } catch (error) {
    console.error('Error in performFeasibilityAnalysis:', error);
    return {
      success: true,
      message: `${greeting}I need to gather more information to analyze your goal feasibility. Could you share your profession and current financial situation?`
    };
  }
};

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

// Function to create a new chat session and return conversation ID
export const createNewChatSession = async (
  userEmail?: string,
  isAuthenticated: boolean = false
): Promise<{ success: boolean; conversationId: string; error?: string }> => {
  try {
    // Generate a unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('ChatbotService: Created new chat session with ID:', conversationId);
    
    // If user is authenticated, create a conversation record in database
    if (isAuthenticated && userEmail) {
      try {
        // Import chatService dynamically to avoid circular dependencies
        const { chatService } = await import('./chatService');
        
        // Create conversation record
        const conversationData = {
          user_email: userEmail,
          title: 'New Financial Advisory Session',
          summary: 'Financial planning conversation started',
          message_count: 0,
          created_at: new Date(),
          last_message_at: new Date()
        };
        
        // Store the conversation
        const result = await chatService.storeConversation({
          ...conversationData,
          messages: []
        });
        
        if (result.success) {
          console.log('ChatbotService: Successfully created conversation in database:', result.conversationId);
          return { success: true, conversationId: result.conversationId || conversationId };
        } else {
          console.warn('ChatbotService: Failed to create conversation in database, using local ID:', result.error);
          return { success: true, conversationId };
        }
      } catch (dbError) {
        console.error('ChatbotService: Database error creating conversation, using local ID:', dbError);
        return { success: true, conversationId };
      }
    }
    
    // For unauthenticated users, return the local conversation ID
    return { success: true, conversationId };
    
  } catch (error) {
    console.error('ChatbotService: Error creating chat session:', error);
    const fallbackId = `conv_${Date.now()}_fallback`;
    return { success: false, conversationId: fallbackId, error: 'Failed to create chat session' };
  }
};

// Function to save entire conversation to database
export const saveConversationToDatabase = async (
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  userEmail?: string,
  isAuthenticated: boolean = false
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isAuthenticated || !userEmail) {
      console.log('ChatbotService: User not authenticated, skipping database save');
      return { success: true };
    }
    
    // Import chatService dynamically to avoid circular dependencies
    const { chatService } = await import('./chatService');
    
    // Convert messages to the format expected by chatService
    const chatMessages = messages.map((msg, index) => ({
      user_email: userEmail,
      message_text: msg.content,
      sender: msg.role as 'user' | 'bot',
      timestamp: new Date(Date.now() + index * 1000), // Ensure unique timestamps
      conversation_id: conversationId
    }));
    
    // Store all messages
    let successCount = 0;
    for (const message of chatMessages) {
      try {
        const result = await chatService.storeMessage(message);
        if (result.success) {
          successCount++;
        }
      } catch (error) {
        console.error('ChatbotService: Error storing message:', error);
      }
    }
    
    console.log(`ChatbotService: Successfully stored ${successCount}/${chatMessages.length} messages to database`);
    
    if (successCount > 0) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to store any messages' };
    }
    
  } catch (error) {
    console.error('ChatbotService: Error saving conversation to database:', error);
    return { success: false, error: 'Database save failed' };
  }
};

// Function to analyze user input complexity and determine what additional information is needed
const analyzeUserInputComplexity = (
  userMessage: string, 
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): {
  complexity: 'low' | 'medium' | 'high';
  missingInfo: string[];
  needsClarification: string[];
  suggestedQuestions: string[];
} => {
  const result: {
    complexity: 'low' | 'medium' | 'high';
    missingInfo: string[];
    needsClarification: string[];
    suggestedQuestions: string[];
  } = {
    complexity: 'low',
    missingInfo: [],
    needsClarification: [],
    suggestedQuestions: []
  };

  try {
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const currentMessage = userMessage.toLowerCase();
    const allContent = (allUserMessages + ' ' + currentMessage).toLowerCase();
    
    // Check for multiple goals
    const goalKeywords = ['goal', 'want', 'need', 'save', 'buy', 'achieve', 'plan'];
    const goalCount = goalKeywords.filter(keyword => allContent.includes(keyword)).length;
    
    // Check for complex financial situations
    const hasMultipleIncomeSources = (allContent.match(/income|salary|lpa|earn|business|freelance|consulting/g) || []).length > 2;
    const hasExistingInvestments = allContent.includes('existing') || allContent.includes('already') || allContent.includes('current');
    const hasDependents = allContent.includes('family') || allContent.includes('children') || allContent.includes('spouse') || allContent.includes('parents');
    
    // Check for vague or incomplete information
    const vagueResponses = [
      'maybe', 'not sure', 'dont know', "don't know", 'unsure', 'probably', 'around', 'approximately',
      'some', 'few', 'several', 'various', 'different'
    ];
    const hasVagueInfo = vagueResponses.some(vague => currentMessage.includes(vague));
    
    // Check for specific constraints or requirements
    const hasConstraints = allContent.includes('constraint') || allContent.includes('requirement') || 
                          allContent.includes('preference') || allContent.includes('condition');
    
    // Determine complexity level
    if (goalCount > 2 || hasMultipleIncomeSources || hasConstraints || hasVagueInfo) {
      result.complexity = 'high';
    } else if (goalCount > 1 || hasExistingInvestments || hasDependents) {
      result.complexity = 'medium';
    } else {
      result.complexity = 'low';
    }
    
    // Identify missing information
    if (!allContent.includes('timeline') && !allContent.includes('year') && !allContent.includes('month')) {
      result.missingInfo.push('timeline');
    }
    if (!allContent.includes('amount') && !allContent.includes('lakh') && !allContent.includes('crore')) {
      result.missingInfo.push('amount');
    }
    if (!allContent.includes('income') && !allContent.includes('salary') && !allContent.includes('lpa')) {
      result.missingInfo.push('income');
    }
    if (!allContent.includes('risk') && !allContent.includes('conservative') && !allContent.includes('moderate') && !allContent.includes('aggressive')) {
      result.missingInfo.push('risk_appetite');
    }
    if (!allContent.includes('profession') && !allContent.includes('job') && !allContent.includes('work')) {
      result.missingInfo.push('profession');
    }
    
    // Identify areas needing clarification
    if (hasVagueInfo) {
      result.needsClarification.push('specific_details');
    }
    if (goalCount > 1) {
      result.needsClarification.push('goal_prioritization');
    }
    if (hasMultipleIncomeSources) {
      result.needsClarification.push('income_breakdown');
    }
    if (hasExistingInvestments) {
      result.needsClarification.push('current_portfolio');
    }
    
    // Generate suggested questions based on missing information
    if (result.missingInfo.includes('timeline')) {
      result.suggestedQuestions.push('What is your target timeline for achieving this goal?');
    }
    if (result.missingInfo.includes('amount')) {
      result.suggestedQuestions.push('What is the approximate cost of your goal?');
    }
    if (result.missingInfo.includes('income')) {
      result.suggestedQuestions.push('What is your current monthly income and investment capacity?');
    }
    if (result.missingInfo.includes('risk_appetite')) {
      result.suggestedQuestions.push('What is your investment risk preference?');
    }
    if (result.missingInfo.includes('profession')) {
      result.suggestedQuestions.push('What is your current profession?');
    }
    
    // Add clarification questions for complex scenarios
    if (result.needsClarification.includes('goal_prioritization')) {
      result.suggestedQuestions.push('Which goal is your top priority?');
    }
    if (result.needsClarification.includes('income_breakdown')) {
      result.suggestedQuestions.push('Can you break down your income sources?');
    }
    if (result.needsClarification.includes('current_portfolio')) {
      result.suggestedQuestions.push('What are your current investments and their values?');
    }
    
    console.log('User input complexity analysis:', result);
    return result;
    
  } catch (error) {
    console.error('Error analyzing user input complexity:', error);
    return result;
  }
};

// Function to extract and convert financial figures from user input
const extractFinancialFigures = (userInput: string): {
  amount?: number;
  timeline?: number;
  monthlyInvestment?: number;
  income?: number;
  existingSavings?: number;
} => {
  const result: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
    existingSavings?: number;
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
    
    // Check for existing savings patterns
    const existingSavingsPatterns = [
      /(?:have|existing|savings|saved|invested|fd|mutual fund|asset).*?(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t)/gi,
      /(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t).*?(?:savings|fd|mutual fund|investment|asset)/gi
    ];
    
    for (const pattern of existingSavingsPatterns) {
      const match = userInput.match(pattern);
      if (match) {
        const amount = convertIndianNumberFormat(match[0]);
        if (amount && !result.existingSavings) {
          result.existingSavings = amount;
          break;
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
  
  goalQuestion: formatQuestionWithSamples("What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too", 'goal'),
  
  disclaimer: "\n\n*This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision"
};

// Updated system instruction based on user's requirements
const SYSTEM_INSTRUCTION = `You are InvestRight Bot, an expert financial advisor for Indian users. Your role is to guide users toward achieving their Key Life Goals through financial planning and unbiased investment advice.

## Communication Style
- Friendly, professional, engaging, and educative.
- Maintain a conversational flow, asking step-by-step questions.
- Use simple, easy-to-understand explanations (avoid jargon unless asked).
- Ask only essential questions to gather necessary information for investment planning.
- Start with 5 core questions, but increase based on user input complexity and information depth needed.
- Be adaptive - ask follow-up questions when users provide incomplete or complex information.
- **ALWAYS provide sample answer formats** when asking questions to help users understand what kind of response is expected.

## Conversation Flow

**Step 1: Welcome Message**
Start with:
"Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice."

Explain briefly what Life Goal Preparedness means:
"Life Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children's education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits."

Then ask:
"Are you ready to start?"

**Step 2: If User Agrees**
- Ask for their name (to address them personally).
- Ask the first question:
"What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too."

**Step 3: Goal Discovery & Analysis (Step-by-Step Process)**

**3.1: Goal, Amount & Timeline Collection**
- Ask for the specific goal, target amount, and timeline
- If user doesn't know the goal amount, search for current market prices and provide tentative estimates
- Use sample answer formats for all questions

**3.2: Income Source & Monthly Savings Assessment**
- Ask about their current income source and profession
- Determine their monthly savings capacity
- Assess their financial stability and income growth potential

**3.3: Existing Savings & Assets Check**
- Ask about their current savings, investments, and assets
- Understand their existing financial foundation
- Calculate total available resources

**3.4: Goal Feasibility Analysis**
- Perform detailed calculations to determine if the goal is achievable
- Consider current savings + monthly investments + expected returns
- Show clear mathematical breakdown of feasibility

**3.5: Feasibility Decision & Next Steps**

**If Goal is ACHIEVABLE:**
- Proceed to Step 4: Investment Plan Generation
- Provide specific investment recommendations
- Show detailed investment strategy with asset allocation

**If Goal is NOT ACHIEVABLE:**
- Explain the reasons with clear calculations
- Ask about their profession for targeted advice
- Suggest alternatives:
  * Modified goal amounts or timelines
  * Income enhancement strategies
  * Skill development opportunities
  * Alternative investment approaches
  * Side business or career advancement options

**Step 4: Investment Plan Generation (Only if Goal is Achievable)**
- Provide comprehensive investment strategy for India (mutual funds, stocks, FDs, PPF, NPS, ELSS)
- Generate detailed investment report with specific recommendations
- Show monthly SIP amounts and asset allocation
- When giving return numbers, always add "*" after the number
- End with disclaimer: "This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision."

**Step 5: Alternative Solutions (If Goal is Not Achievable)**
- Provide profession-specific income enhancement strategies
- Suggest skill development opportunities
- Recommend alternative goal modifications
- Offer creative solutions to bridge the gap

## Rules
1. **Follow the Step-by-Step Process**: Always follow the 5-step process (Goal Collection → Income Assessment → Savings Check → Feasibility Analysis → Plan/Alternatives).
2. **Never Skip Steps**: Complete each step thoroughly before moving to the next.
3. **Goal Amount Research**: If user doesn't know goal amount, search for current market prices and provide realistic estimates.
4. **Mathematical Feasibility**: Always perform detailed calculations to determine goal achievability.
5. **Show Your Work**: Display clear mathematical breakdowns for all calculations.
6. **Profession-Specific Advice**: When goals are not achievable, provide targeted advice based on user's profession.
7. **Alternative Solutions**: Always offer multiple alternatives when goals seem unachievable.
8. **Realistic Guidance**: Never overpromise returns - use conservative estimates.
9. **India-Specific**: Provide India-specific investment recommendations and market data.
10. **Mark Returns**: Always mark ROI numbers with asterisk (*).
11. **Interactive Flow**: Keep conversation engaging (ask → listen → calculate → advise).
12. **Sample Answer Formats**: ALWAYS provide sample answer formats for all questions.
13. **Adaptive Questioning**: Ask follow-up questions when information is incomplete.
14. **Comprehensive Planning**: Only generate investment plans after confirming goal achievability.

## Step-by-Step Process Rules
- **Step 3.1**: Collect goal, amount, timeline - research prices if needed
- **Step 3.2**: Assess income source and monthly savings capacity
- **Step 3.3**: Check existing savings and assets
- **Step 3.4**: Perform feasibility calculations with clear breakdown
- **Step 3.5**: Make decision and proceed accordingly
- **Step 4**: Generate investment plan only if goal is achievable
- **Step 5**: Provide alternatives and income enhancement strategies if goal is not achievable`;

// Few-shot examples to guide the model's tone and structure
const FEW_SHOT_EXAMPLES = `### Few-Shot Examples

---
**Example 1: Step-by-Step Process - Child Education (Goal Achievable)**

**Step 3.1: Goal Collection**
User: I want to save for my child's education in 10 years. I think it will cost 25 lakhs.
Bot: Perfect! Let me help you plan for your child's education. ₹25 lakhs in 10 years is a significant goal. Let me gather some information to create the best plan for you.

**Step 3.2: Income Assessment**
Bot: What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

User: I earn ₹8 LPA and can invest ₹20,000 monthly.

**Step 3.3: Existing Savings Check**
Bot: Do you have any existing savings or investments that we can consider for this goal?

Sample format:
• "I have ₹2 lakhs in FDs"
• "₹5 lakhs in mutual funds already"
• "No existing savings, starting fresh"

User: I have ₹3 lakhs in FDs and ₹2 lakhs in mutual funds.

**Step 3.4: Feasibility Analysis**
Bot: Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹5 lakhs
• Monthly Investment: ₹20,000
• Timeline: 10 years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹5 lakhs in 10 years: ₹12.97 lakhs*
• Future Value of ₹20,000 monthly SIP: ₹20.48 lakhs*
• **Total Accumulation: ₹33.45 lakhs***

**Result: ✅ GOAL IS ACHIEVABLE!** You'll have ₹8.45 lakhs* more than needed.

**Step 4: Investment Plan**
**Investment Strategy:**
📈 **Equity Mutual Funds (70%)**: Large-cap and Flexi-cap funds for growth
🛡️ **Debt Instruments (20%)**: PPF for safety and tax benefits  
💰 **Emergency Fund (10%)**: Liquid funds for 6-month expenses

**Monthly SIP Breakdown:**
• Large-cap Fund: ₹10,000 (50%)
• Flexi-cap Fund: ₹6,000 (30%) 
• PPF: ₹4,000 (20%)

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 2: Step-by-Step Process - House Purchase (Goal Not Achievable)**

**Step 3.1: Goal Collection**
User: I want to buy a house worth 50 lakhs in 5 years.
Bot: Great! A house is a significant investment. Let me help you plan this step by step.

**Step 3.2: Income Assessment**
Bot: What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

User: I earn ₹6 LPA and can invest ₹5,000 monthly.

**Step 3.3: Existing Savings Check**
Bot: Do you have any existing savings or investments for this goal?

Sample format:
• "I have ₹2 lakhs in FDs"
• "₹5 lakhs in mutual funds already"
• "No existing savings, starting fresh"

User: I have ₹1 lakh in savings.

**Step 3.4: Feasibility Analysis**
Bot: Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹1 lakh
• Monthly Investment: ₹5,000
• Timeline: 5 years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹1 lakh in 5 years: ₹1.61 lakhs*
• Future Value of ₹5,000 monthly SIP: ₹3.87 lakhs*
• **Total Accumulation: ₹5.48 lakhs***

**Result: ❌ GOAL IS NOT ACHIEVABLE** - You'll be short by ₹44.52 lakhs*

**Step 5: Alternative Solutions**
Bot: Since your current capacity won't achieve this goal, let me suggest alternatives:

**What is your profession?** This will help me provide targeted advice.

Sample format:
• "Software Engineer"
• "Business Owner"
• "Government Employee"

User: I am a software engineer.

**Profession-Specific Solutions:**
**Income Enhancement Strategies:**
• **Upskilling**: AI/ML, Cloud Computing (20-30%* salary increase)
• **Freelancing**: Upwork, Fiverr (₹15,000-30,000* monthly)
• **Part-time Consulting**: Technical training (₹10,000-20,000* monthly)

**Alternative Goal Options:**
• **Option A**: ₹50 lakhs house in 10 years (₹25,000 monthly)
• **Option B**: ₹30 lakhs house in 5 years (₹35,000 monthly)
• **Option C**: Start with ₹5,000 monthly and increase gradually

**Modified Timeline with Income Growth:**
• Year 1-2: ₹5,000 monthly (while upskilling)
• Year 3-5: ₹15,000 monthly (after salary increase)
• Expected accumulation: ₹12-15 lakhs* in 5 years

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---

**Example 3: Goal Amount Research - User Doesn't Know Cost**

**Step 3.1: Goal Collection with Research**
User: I want to buy a house, but I'm not sure about the cost.
Bot: That's perfectly fine! Let me help you understand the current market prices for houses in India.

**Current House Prices in India (2024):**
• **Tier 1 Cities** (Mumbai, Delhi, Bangalore): ₹80 lakhs - ₹2 crores*
• **Tier 2 Cities** (Pune, Hyderabad, Chennai): ₹40 lakhs - ₹1 crore*
• **Tier 3 Cities** (Indore, Coimbatore, Kochi): ₹25 lakhs - ₹60 lakhs*

**What type of house are you looking for?**
Sample format:
• "2 BHK apartment in Bangalore"
• "3 BHK house in Pune"
• "1 BHK in Mumbai"

User: 2 BHK apartment in Bangalore.

Bot: For a 2 BHK apartment in Bangalore, the current market price ranges from ₹60-80 lakhs* depending on location and amenities.

**What's your preferred budget range?**
Sample format:
• "Around ₹60 lakhs"
• "Between ₹70-80 lakhs"
• "I can stretch to ₹1 crore"

User: Around ₹70 lakhs.

Bot: Perfect! So your goal is to buy a ₹70 lakhs house. What's your target timeline for this purchase?

Sample format:
• "5 years" or "10 years"
• "I want to buy a house in 3 years"
• "My child will start college in 8 years"

User: 5 years.

Bot: Excellent! Now let me gather more information to create your investment plan.

**Step 3.2: Income Assessment**
Bot: What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---

**Example 4: Question with Sample Answer Format**
Bot: What is your target timeline for achieving this goal?

Sample format:
• "5 years" or "10 years"
• "I want to buy a house in 3 years"
• "My child will start college in 8 years"

User: I want to buy a house in 5 years.
Bot: Perfect! A 5-year timeline is good for house purchase. What is the approximate cost of the house you're looking at?

Sample format:
• "50 lakhs" or "1 crore"
• "Around ₹75 lakhs in my city"
• "Between 60-80 lakhs depending on location"

User: Around ₹75 lakhs.
Bot: Great! For ₹75 lakhs in 5 years, you'll need to invest approximately ₹95,000* per month. What is your current monthly income and investment capacity?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 4: Income Enhancement Strategies**
User: I am a software engineer earning ₹8 LPA.
Bot: Perfect! With your technical background, here are income enhancement strategies:

**Immediate Actions:**
• **Upskilling**: AI/ML, Cloud Computing, DevOps (potential 20-30%* salary increase)
• **Freelancing**: Upwork, Fiverr for side income (₹20,000-50,000* monthly)
• **Part-time Consulting**: Technical training or project consulting

**Investment Strategy:**
📈 **Equity SIP**: ₹15,000 monthly in diversified funds
🛡️ **Tax Savings**: ELSS funds up to ₹1.5 lakhs under 80C
💰 **Emergency Fund**: 6 months of expenses in liquid funds

**Expected Growth**: With upskilling and side income, you could reach ₹12-15 LPA* within 2-3 years.

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 4: Lifestyle Goal - Travel**
User: I want to take a Europe trip costing 8 lakhs in 3 years.
Bot: To save 8 lakhs in 3 years, assuming 8%* returns, you need to invest around ₹20,000* per month.

**Investment Plan:**
📈 **Short-term Goals Fund**: ₹15,000 monthly in liquid/debt funds
🛡️ **Tax-efficient Savings**: ₹5,000 monthly in ELSS for tax benefits

**Alternative Approaches:**
• **Extended Timeline**: 4 years instead of 3 (₹15,000 monthly)
• **Reduced Budget**: 6 lakhs in 3 years (₹15,000 monthly)
• **Income Supplement**: Side income through:
  - Online tutoring (₹10,000-15,000* monthly)
  - Freelance writing/design (₹8,000-12,000* monthly)
  - Part-time consulting (₹15,000-25,000* monthly)

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 5: Complex Scenario - Multiple Goals**
User: I want to save for my child's education (25 lakhs in 10 years), buy a house (50 lakhs in 8 years), and plan for retirement (2 crores in 20 years). I earn 12 LPA and can invest 30,000 monthly.
Bot: This is a comprehensive financial planning scenario! Let me break this down step by step.

**Goal Analysis:**
📚 **Child Education**: 25 lakhs in 10 years (₹13,000* monthly at 10%* returns)
🏠 **House Purchase**: 50 lakhs in 8 years (₹35,000* monthly at 10%* returns)
🌅 **Retirement**: 2 crores in 20 years (₹25,000* monthly at 10%* returns)

**Total Required**: ₹73,000* monthly vs. Your Capacity: ₹30,000 monthly

**Recommendations:**
1. **Prioritize Goals**: Which goal is most important to you right now?
2. **Timeline Adjustment**: Consider extending some timelines
3. **Income Enhancement**: With your current capacity, you'll need additional income sources

**Questions to Clarify:**
• Which goal is your top priority?
• Are you open to extending any timelines?
• What's your profession? I can suggest income enhancement strategies.

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 6: Vague Information - Needs Clarification**
User: I want to save some money for maybe a house or education, not sure exactly. I earn around 8-10 LPA and can invest some amount monthly.
Bot: I understand you're thinking about saving, but I need more specific information to create a proper plan.

**Questions to Clarify:**
• **Goal Specificity**: Are you leaning more towards a house or education? Or both?
• **Timeline**: When do you think you might need this money?
• **Amount**: What's your rough estimate for the house cost or education expenses?
• **Investment Capacity**: What's your approximate monthly investment capacity?

**Current Understanding:**
💰 **Income Range**: ₹8-10 LPA (₹67,000-83,000 monthly)
📈 **Investment**: "Some amount monthly" - could you be more specific?

Once you provide these details, I can create a personalized investment strategy for you!

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Always end responses with:**
"This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision."`;

export const sendChatMessageToGemini = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = [],
  userInfo?: { username?: string; isAuthenticated?: boolean },
  conversationId?: string
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean; conversationId?: string }> => {
  try {
    console.log('ChatbotService: Starting with userMessage:', userMessage);
    console.log('ChatbotService: Conversation history length:', conversationHistory.length);
    console.log('ChatbotService: Full conversation history:', conversationHistory);
    console.log('ChatbotService: UserInfo received:', userInfo);
    console.log('ChatbotService: Is user authenticated:', userInfo?.isAuthenticated);
    console.log('ChatbotService: Username:', userInfo?.username);
    
    // Extract user's name from conversation history or user info
    let userName = '';
    if (userInfo?.isAuthenticated && userInfo?.username) {
      // Use authenticated user's username
      userName = userInfo.username;
      console.log('ChatbotService: Using authenticated username:', userName);
    } else if (conversationHistory.length >= 4) {
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
      console.log('ChatbotService: UserInfo at first message:', userInfo);
      console.log('ChatbotService: Is authenticated:', userInfo?.isAuthenticated);
      console.log('ChatbotService: Username:', userInfo?.username);
      
      // If user is authenticated and has username, skip name question
      if (userInfo?.isAuthenticated && userInfo?.username) {
        console.log('ChatbotService: User is authenticated, skipping name question');
        return {
          success: true,
          message: `${FINANCIAL_ADVISOR_FLOW.welcome}\n\n${FINANCIAL_ADVISOR_FLOW.lifeGoalExplanation}\n\n${FINANCIAL_ADVISOR_FLOW.startQuestion}`
        };
      } else {
        console.log('ChatbotService: User is NOT authenticated, will ask for name later');
        return {
          success: true,
          message: `${FINANCIAL_ADVISOR_FLOW.welcome}\n\n${FINANCIAL_ADVISOR_FLOW.lifeGoalExplanation}\n\n${FINANCIAL_ADVISOR_FLOW.startQuestion}`
        };
      }
    }

    // Handle second message - Check if user is ready to start
    if (conversationHistory.length === 1) {
      console.log('ChatbotService: Handling second message, user response:', userMessage);
      console.log('ChatbotService: UserInfo at second message:', userInfo);
      console.log('ChatbotService: Is authenticated:', userInfo?.isAuthenticated);
      console.log('ChatbotService: Username:', userInfo?.username);
      
      const userResponse = userMessage.toLowerCase();
      if (userResponse.includes('yes') || userResponse.includes('ready') || userResponse.includes('start') || userResponse.includes('ok') || userResponse.includes('sure') || userResponse.includes('go')) {
        console.log('ChatbotService: User agreed to start');
        
        // If user is authenticated, skip name question and go directly to goal question
        if (userInfo?.isAuthenticated && userInfo?.username) {
          console.log('ChatbotService: Authenticated user, going directly to goal question');
          return {
            success: true,
            message: `Great! ${userInfo.username}, ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
          };
        } else {
          console.log('ChatbotService: Unauthenticated user, asking for name');
          return {
            success: true,
            message: FINANCIAL_ADVISOR_FLOW.nameQuestion
          };
        }
      } else {
        console.log('ChatbotService: User not ready yet');
        return {
          success: true,
          message: "I understand you might not be ready yet. Take your time! When you're ready to start, just let me know with a 'yes' or 'ready'."
        };
      }
    }

    // Handle third message - Get user's name (only for unauthenticated users)
    if (conversationHistory.length === 2) {
      console.log('ChatbotService: Handling third message - getting name');
      
      // If user is authenticated, this shouldn't happen, but handle gracefully
      if (userInfo?.isAuthenticated && userInfo?.username) {
        console.log('ChatbotService: Authenticated user reached name question, going to goal question');
        return {
          success: true,
          message: `${userInfo.username}, ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
        };
      }
      
      // For unauthenticated users, get their name
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
      
      // For authenticated users, this is the first question after welcome
      // For unauthenticated users, this is after they provided their name
      let greeting = '';
      if (userInfo?.isAuthenticated && userInfo?.username) {
        greeting = `${userInfo.username}, `;
        console.log('ChatbotService: Using authenticated username for greeting:', userInfo.username);
      } else if (conversationHistory.length >= 4) {
        // Extract from conversation history for unauthenticated users
        const nameMessage = conversationHistory[3];
        if (nameMessage.role === 'user') {
          const extractedName = nameMessage.content.trim();
          greeting = `${extractedName}, `;
          console.log('ChatbotService: Using extracted name from conversation:', extractedName);
        }
      }
      
      console.log('ChatbotService: Generated greeting:', greeting);
      return {
        success: true,
        message: `${greeting}${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
      };
    }

    // After goal is provided, intelligently determine what additional information is needed
    // For authenticated users, the conversation flow is different (no name question)
    let questionCount;
    if (userInfo?.isAuthenticated && userInfo?.username) {
      // For authenticated users: welcome(0) -> ready(1) -> goal(2) -> follow-up questions start from 3
      questionCount = Math.max(0, conversationHistory.length - 3);
    } else {
      // For unauthenticated users: welcome(0) -> ready(1) -> name(2) -> goal(3) -> follow-up questions start from 4
      questionCount = Math.max(0, conversationHistory.length - 4);
    }
    console.log('ChatbotService: Current state - Conversation length:', conversationHistory.length, 'Question count:', questionCount, 'Authenticated:', userInfo?.isAuthenticated);
    
    // Extract financial figures and check what information we have
    const extractedInfo = extractFinancialFigures(userMessage);
    const hasGoal = conversationHistory.some(msg => msg.role === 'user' && msg.content.length > 10);
    const hasFinancialInfo = extractedInfo.amount || extractedInfo.timeline || extractedInfo.monthlyInvestment || extractedInfo.income;
    
    // Analyze all conversation to see if we have enough information
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const allExtracted = extractFinancialFigures(allUserMessages);
    const hasGoalInfo = conversationHistory.some(msg => msg.role === 'user' && (msg.content.includes('goal') || msg.content.includes('want') || msg.content.includes('need')));
    const hasFinancialData = allExtracted.amount || allExtracted.income || allExtracted.monthlyInvestment;
    
    // Check for essential information needed for investment planning
    const hasTimeline = allExtracted.timeline || allUserMessages.includes('year') || allUserMessages.includes('month');
    const hasRiskAppetite = allUserMessages.includes('conservative') || allUserMessages.includes('moderate') || allUserMessages.includes('aggressive') || allUserMessages.includes('risk');
    const hasProfession = allUserMessages.includes('engineer') || allUserMessages.includes('doctor') || allUserMessages.includes('teacher') || allUserMessages.includes('business') || allUserMessages.includes('profession') || allUserMessages.includes('job');
    
    console.log('ChatbotService: Information status:', { 
      hasGoal, 
      hasGoalInfo, 
      hasFinancialInfo, 
      hasFinancialData, 
      hasTimeline,
      hasRiskAppetite,
      hasProfession,
      extractedInfo, 
      allExtracted 
    });
    
    // Check if we should generate the investment plan
    // Conditions: Either have goal+financial data OR have all essential info OR user provided comprehensive information
    const hasEssentialInfo = hasGoalInfo && hasFinancialData && hasTimeline;
    
    // Analyze user input complexity to determine if more questions are needed
    const userInputComplexity = analyzeUserInputComplexity(userMessage, conversationHistory);
    const needsMoreQuestions = userInputComplexity.complexity === 'high' || userInputComplexity.missingInfo.length > 0;
    
    // Check if we have sufficient information for comprehensive planning
    const hasSufficientInfo = hasEssentialInfo && !needsMoreQuestions;
    
    // Determine if we should generate plan or continue asking questions
    const shouldGeneratePlan = hasSufficientInfo || 
                               (conversationHistory.length >= (userInfo?.isAuthenticated ? 10 : 12)) || // Increased limit for complex cases
                               (questionCount >= 8 && hasEssentialInfo); // Allow up to 8 questions for complex scenarios
    
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
        
        // Add a header indicating this is a comprehensive investment report
        const reportHeader = `🎯 **INVESTMENT PLAN GENERATED** 🎯\n\n`;
        const fullMessage = reportHeader + advice.message;
        
        return {
          success: advice.success,
          message: fullMessage,
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
    
    // Follow the step-by-step process for goal analysis
    if (conversationHistory.length >= (userInfo?.isAuthenticated ? 3 : 4)) {
      console.log('ChatbotService: Following step-by-step process for goal analysis');
      
      // Analyze what information we have and what step we're on
      const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
      const allExtracted = extractFinancialFigures(allUserMessages);
      
      // Determine current step based on conversation history
      const currentStep = determineCurrentStep(conversationHistory, allExtracted);
      console.log('ChatbotService: Current step:', currentStep);
      
      // Generate appropriate question based on current step
      return await generateStepBasedQuestion(currentStep, conversationHistory, allExtracted, userInfo);
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

const generateAdaptiveQuestion = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  complexity: {
    complexity: 'low' | 'medium' | 'high';
    missingInfo: string[];
    needsClarification: string[];
    suggestedQuestions: string[];
  },
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    // Extract user's name for personalization
    let userName = '';
    if (userInfo?.isAuthenticated && userInfo?.username) {
      userName = userInfo.username;
    } else if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Generate questions based on complexity analysis
    if (complexity.suggestedQuestions.length > 0) {
      // Use the first suggested question from complexity analysis
      const question = complexity.suggestedQuestions[0];
      return {
        success: true,
        message: `${greeting}${question}`
      };
    }
    
    // Generate questions based on missing information
    if (complexity.missingInfo.length > 0) {
      const missingInfo = complexity.missingInfo[0];
      let question = '';
      
      switch (missingInfo) {
        case 'timeline':
          question = formatQuestionWithSamples('What is your target timeline for achieving this goal?', 'timeline');
          break;
        case 'amount':
          question = formatQuestionWithSamples('What is the approximate cost of your goal?', 'amount');
          break;
        case 'income':
          question = formatQuestionWithSamples('What is your current monthly income and how much can you invest monthly?', 'income');
          break;
        case 'risk_appetite':
          question = formatQuestionWithSamples('What is your investment risk preference?', 'risk_appetite');
          break;
        case 'profession':
          question = formatQuestionWithSamples('What is your current profession? This helps me suggest income enhancement strategies.', 'profession');
          break;
        default:
          question = 'Could you provide more specific details about your financial situation?';
      }
      
      return {
        success: true,
        message: `${greeting}${question}`
      };
    }
    
    // Generate clarification questions for complex scenarios
    if (complexity.needsClarification.length > 0) {
      const clarification = complexity.needsClarification[0];
      let question = '';
      
      switch (clarification) {
        case 'goal_prioritization':
          question = 'You mentioned multiple goals. Which one is your top priority for now?';
          break;
        case 'income_breakdown':
          question = 'Can you break down your income sources and their approximate amounts?';
          break;
        case 'current_portfolio':
          question = 'What are your current investments and their approximate values?';
          break;
        case 'specific_details':
          question = 'Could you be more specific about your requirements? For example, exact amounts, timelines, or preferences.';
          break;
        default:
          question = 'Could you clarify this aspect of your financial situation?';
      }
      
      return {
        success: true,
        message: `${greeting}${question}`
      };
    }
    
    // Fallback question
    return {
      success: true,
      message: `${greeting}Could you share more details about your goal, timeline, or current financial situation?`
    };
    
  } catch (error) {
    console.error('Error in generateAdaptiveQuestion:', error);
    return {
      success: true,
      message: 'Could you provide more information about your financial goals and situation?'
      };
    }
};

const generateRelevantQuestion = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  userInfo?: { username?: string; isAuthenticated?: boolean }
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
    if (userInfo?.isAuthenticated && userInfo?.username) {
      // Use authenticated user's username
      userName = userInfo.username;
    } else if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Analyze conversation to track what information has been collected
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const allExtracted = extractFinancialFigures(allUserMessages);
    
    // Track what information has been collected to avoid repetitive questions
    const collectedInfo = {
      goal: allUserMessages.toLowerCase().includes('goal') || allUserMessages.toLowerCase().includes('want') || allUserMessages.toLowerCase().includes('need'),
      amount: !!allExtracted.amount || allUserMessages.toLowerCase().includes('lakh') || allUserMessages.toLowerCase().includes('crore'),
      timeline: !!allExtracted.timeline || allUserMessages.toLowerCase().includes('year') || allUserMessages.toLowerCase().includes('month'),
      income: !!allExtracted.income || allUserMessages.toLowerCase().includes('lpa') || allUserMessages.toLowerCase().includes('salary') || allUserMessages.toLowerCase().includes('earn'),
      investment: !!allExtracted.monthlyInvestment || allUserMessages.toLowerCase().includes('invest') || allUserMessages.toLowerCase().includes('save'),
      risk: allUserMessages.toLowerCase().includes('risk') || allUserMessages.toLowerCase().includes('conservative') || allUserMessages.toLowerCase().includes('moderate') || allUserMessages.toLowerCase().includes('aggressive'),
      age: allUserMessages.toLowerCase().includes('age') || allUserMessages.toLowerCase().includes('old'),
      profession: allUserMessages.toLowerCase().includes('profession') || allUserMessages.toLowerCase().includes('job') || allUserMessages.toLowerCase().includes('work'),
      existing: allUserMessages.toLowerCase().includes('existing') || allUserMessages.toLowerCase().includes('savings') || allUserMessages.toLowerCase().includes('investment') || allUserMessages.toLowerCase().includes('asset'),
      dependents: allUserMessages.toLowerCase().includes('dependent') || allUserMessages.toLowerCase().includes('family') || allUserMessages.toLowerCase().includes('child') || allUserMessages.toLowerCase().includes('spouse')
    };
    
    console.log('ChatbotService: Collected information analysis:', collectedInfo);
    
    // Check if we have enough information to generate plan
    const hasGoalInfo = collectedInfo.goal;
    const hasFinancialData = allExtracted.amount || allExtracted.income || allExtracted.monthlyInvestment;
    const hasTimeline = collectedInfo.timeline;
    
    // Determine if we should generate plan now
    const shouldGeneratePlan = (hasGoalInfo && hasFinancialData && hasTimeline) || 
                              (conversationHistory.length >= (userInfo?.isAuthenticated ? 7 : 8)); // Max 7 exchanges for authenticated, 8 for unauthenticated
    
    if (shouldGeneratePlan) {
      console.log('ChatbotService: Have sufficient info, generating investment plan directly');
      
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
        return {
          success: true,
          message: `${greeting}Perfect! I have gathered the essential information to create your personalized investment plan. Let me analyze your goals and create a comprehensive investment strategy for you.\n\n🔄 **Generating your personalized investment plan... Please wait.**`,
          isGeneratingPlan: true
        };
      }
    }
    
    // Intelligently determine what information is missing and prioritize questions
    const allContent = allUserMessages.toLowerCase();
    
    console.log('ChatbotService: Analyzing conversation for missing info:', allExtracted);
    
    // Check what key information is missing and prioritize by importance
    const missingInfo = {
      timeline: !collectedInfo.timeline,
      amount: !collectedInfo.amount,
      income: !collectedInfo.income,
      investment: !collectedInfo.investment,
      risk: !collectedInfo.risk,
      profession: !collectedInfo.profession,
      existing: !collectedInfo.existing
    };
    
    console.log('ChatbotService: Missing information analysis:', missingInfo);
    
    // Priority-based question selection following the 5-question structure
    const priorityQuestions = [
      // Question 1: Timeline & Amount (Essential for goal planning)
      {
        condition: missingInfo.timeline && missingInfo.amount,
        message: `${greeting}Excellent goal! To create your investment strategy, I need to know:\n\n📅 **Timeline**: When do you want to achieve this goal? (e.g., 5 years, 10 years)\n💰 **Target Amount**: What's the approximate cost? (e.g., 25 lakhs, 1 crore)\n\nYou can answer both together like: "I need 50 lakhs in 8 years"`
      },
      // Question 2: Income & Investment Capacity (Financial feasibility)
      {
        condition: missingInfo.income && missingInfo.investment,
        message: `${greeting}Now I need to understand your financial capacity:\n\n💼 **Monthly Income**: What do you currently earn? (e.g., 8 LPA, 60,000 per month)\n📈 **Investment Capacity**: How much can you invest monthly towards this goal? (e.g., 15,000 per month)\n\nYou can combine like: "I earn 10 LPA and can invest 20,000 monthly"`
      },
      // Question 3: Risk Appetite (Investment strategy)
      {
        condition: missingInfo.risk,
        message: `${greeting}What's your investment risk preference?\n\n🛡️ **Conservative**: Safe investments, lower returns (FD, PPF)\n⚖️ **Moderate**: Balanced mix, moderate returns (Mutual Funds)\n🚀 **Aggressive**: Higher risk, higher potential returns (Equity, Stocks)\n\nJust say "moderate" or describe your preference.`
      },
      // Question 4: Profession (Income enhancement strategies)
      {
        condition: missingInfo.profession,
        message: `${greeting}What is your current profession? This helps me understand your income stability and suggest upskilling or side business opportunities if needed.`
      },
      // Question 5: Existing Investments (Portfolio optimization)
      {
        condition: missingInfo.existing,
        message: `${greeting}Do you have any existing savings, investments, or assets? This helps me optimize your portfolio and avoid duplication.`
      }
    ];
    
    // Find the first missing information to ask about
    for (const question of priorityQuestions) {
      if (question.condition) {
        return {
          success: true,
          message: question.message
        };
      }
    }
    
    // If we have most info, ask for any remaining details
    if (conversationHistory.length >= 6) {
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
Conversation length: ${conversationHistory.length}

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
    const greeting = conversationHistory.length >= 4 ? `${conversationHistory[3].content}, ` : '';
    
    const fallbackQuestions = [
      `${greeting}What is your target timeline for achieving this goal?`,
      `${greeting}What is your current monthly income and how much can you allocate for investments?`,
      `${greeting}How would you describe your risk tolerance - conservative, moderate, or aggressive?`,
      `${greeting}What is your current profession and main sources of income?`,
      `${greeting}Do you have any existing savings, investments, or assets?`,
      `${greeting}What is your current age and do you have any financial dependents?`
    ];
    
    // Select question based on conversation length to avoid repetition
    const questionIndex = Math.min(Math.floor((conversationHistory.length - 4) / 2), fallbackQuestions.length - 1);
    const fallbackQuestion = fallbackQuestions[questionIndex] || `${greeting}Could you tell me more about your financial background?`;
    
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

**Report Structure:**
- Start with "🎯 **YOUR PERSONALIZED INVESTMENT PLAN** 🎯"
- Include goal summary, feasibility analysis, investment strategy, and action plan
- Use emojis and formatting for better readability
- Provide specific mutual fund categories and allocation percentages
- Include monthly SIP breakdown with exact amounts

Rules:
- Mark all ROI numbers with asterisk (*)
- Keep advice India-specific and practical
- Use friendly, professional tone
- Address user by name: ${greeting}
- Be realistic about goal achievability
- Provide concrete financial calculations using the exact figures provided
- If goal seems unachievable, offer constructive alternatives
- Generate a comprehensive investment report
- Keep response under 800 words for detailed planning
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
    { role: 'user' as const, content: 'Some FDs and savings' }
  ];
  
  console.log('Testing financial advice generation with sample conversation (5 questions)...');
  return await generateFinancialAdvice('Generate my financial plan', testConversation);
};

// Test function to verify the 5-question flow
export const testFiveQuestionFlow = async (): Promise<{ success: boolean; message: string }> => {
  const testConversation = [
    { role: 'assistant' as const, content: 'Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children\'s education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.\n\nAre you ready to start?' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name? I\'d love to address you personally throughout our conversation.' },
    { role: 'user' as const, content: 'Priya' },
    { role: 'assistant' as const, content: 'Nice to meet you, Priya! What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too\n\nSample format:\n• "Buy a house worth ₹1 crore"\n• "Save for child\'s education"\n• "Plan for retirement"' },
    { role: 'user' as const, content: 'I want to buy a house worth 50 lakhs' },
    { role: 'assistant' as const, content: 'Excellent goal! To create your investment strategy, I need to know:\n\n📅 **Timeline**: When do you want to achieve this goal? (e.g., 5 years, 10 years)\n💰 **Target Amount**: What\'s the approximate cost? (e.g., 25 lakhs, 1 crore)\n\nYou can answer both together like: "I need 50 lakhs in 8 years"' },
    { role: 'user' as const, content: 'I need 50 lakhs in 8 years' },
    { role: 'assistant' as const, content: 'Now I need to understand your financial capacity:\n\n💼 **Monthly Income**: What do you currently earn? (e.g., 8 LPA, 60,000 per month)\n📈 **Investment Capacity**: How much can you invest monthly towards this goal? (e.g., 15,000 per month)\n\nYou can combine like: "I earn 10 LPA and can invest 20,000 monthly"' },
    { role: 'user' as const, content: 'I earn 8 LPA and can invest 15,000 monthly' },
    { role: 'assistant' as const, content: 'What\'s your investment risk preference?\n\n🛡️ **Conservative**: Safe investments, lower returns (FD, PPF)\n⚖️ **Moderate**: Balanced mix, moderate returns (Mutual Funds)\n🚀 **Aggressive**: Higher risk, higher potential returns (Equity, Stocks)\n\nJust say "moderate" or describe your preference.' },
    { role: 'user' as const, content: 'Moderate' },
    { role: 'assistant' as const, content: 'What is your current profession? This helps me understand your income stability and suggest upskilling or side business opportunities if needed.' },
    { role: 'user' as const, content: 'Software Engineer' },
    { role: 'assistant' as const, content: 'Do you have any existing savings, investments, or assets? This helps me optimize your portfolio and avoid duplication.' },
    { role: 'user' as const, content: 'Some FDs worth 2 lakhs' }
  ];
  
  console.log('Testing 5-question flow with sample conversation...');
  return await generateFinancialAdvice('Generate my investment plan', testConversation);
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

// Test function to verify adaptive questioning for complex scenarios
export const testAdaptiveQuestioning = async (): Promise<{ success: boolean; message: string }> => {
  const complexConversation = [
    { role: 'assistant' as const, content: 'Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children\'s education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.\n\nAre you ready to start?' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name? I\'d love to address you personally throughout our conversation.' },
    { role: 'user' as const, content: 'Rahul' },
    { role: 'assistant' as const, content: 'Nice to meet you, Rahul! What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too\n\nSample format:\n• "Buy a house worth ₹1 crore"\n• "Save for child\'s education"\n• "Plan for retirement"' },
    { role: 'user' as const, content: 'I want to save some money for maybe a house or education, not sure exactly. I earn around 8-10 LPA and can invest some amount monthly.' }
  ];
  
  console.log('Testing adaptive questioning for complex scenario...');
  return await generateFinancialAdvice('Generate my investment plan', complexConversation);
};

// Test function to verify multiple goals scenario
export const testMultipleGoals = async (): Promise<{ success: boolean; message: string }> => {
  const multipleGoalsConversation = [
    { role: 'assistant' as const, content: 'Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children\'s education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.\n\nAre you ready to start?' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name? I\'d love to address you personally throughout our conversation.' },
    { role: 'user' as const, content: 'Anita' },
    { role: 'assistant' as const, content: 'Nice to meet you, Anita! What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too\n\nSample format:\n• "Buy a house worth ₹1 crore"\n• "Save for child\'s education"\n• "Plan for retirement"' },
    { role: 'user' as const, content: 'I want to save for my child\'s education (25 lakhs in 10 years), buy a house (50 lakhs in 8 years), and plan for retirement (2 crores in 20 years). I earn 12 LPA and can invest 30,000 monthly.' }
  ];
  
  console.log('Testing multiple goals scenario...');
  return await generateFinancialAdvice('Generate my investment plan', multipleGoalsConversation);
};