# System Prompt Update - 7 Questions Maximum

## 🎯 **Update Summary:**

Updated the InvestRight chatbot to follow the new system prompt requirements, changing from 6 questions to 7 questions maximum before providing comprehensive financial advice.

## 🔧 **Key Changes Implemented:**

### **1. Updated Question Flow from 6 to 7 Questions:**

#### **Previous Flow (6 Questions):**
- Conversation length: 12 messages (6 user-bot exchanges)
- Questions: 4 initial + 2 follow-up questions

#### **New Flow (7 Questions):**
- Conversation length: 14 messages (7 user-bot exchanges)
- Questions: 4 initial + 3 follow-up questions

### **2. Enhanced Question Structure:**

#### **Questions 1-4 (Initial Flow):**
1. ✅ **Welcome & Life Goal Explanation** - Introduces concept of Life Goal Preparedness
2. ✅ **Ready to Start** - Confirms user's readiness to begin planning
3. ✅ **Name Collection** - Gets user's name for personalization
4. ✅ **Goal Sharing** - User describes their inspirational life goal

#### **Questions 5-7 (Enhanced Follow-up):**
5. ✅ **Timeline & Cost Analysis** - Target timeline and goal cost (with research offer)
6. ✅ **Financial Capacity** - Monthly income and investment allocation
7. ✅ **Risk Appetite** - Investment risk tolerance (Conservative/Moderate/Aggressive)
8. ✅ **Profession & Income Sources** - Current profession and earning potential
9. ✅ **Existing Assets** - Current savings, investments, or assets
10. ✅ **Age & Dependents** - Age and financial dependents for planning
11. ✅ **Comprehensive Analysis** - Goal cost, feasibility, investment strategy, alternatives

### **3. Updated System Instructions:**

#### **Question Generation:**
```typescript
// Changed from 6 to 7 questions
const systemInstruction = `You are an expert financial advisor. Based on the conversation history, generate the next relevant follow-up question to better understand the user's financial situation and goals.

Current question number: ${questionNumber} of 7 total questions`;
```

#### **Financial Advice Generation:**
```typescript
// Changed from 6 to 7 questions
const systemInstruction = `You are an expert financial advisor for Indian investments. 

Based on this comprehensive conversation (7 questions asked), provide a detailed financial plan including:`;
```

### **4. Enhanced Question Logic:**

#### **Structured Question Flow:**
```typescript
if (questionNumber === 2) {
  // Timeline & Cost Analysis
  return { message: "Great goal! To help you plan better, I need to understand two important things:\n\n1. What is your target timeline for achieving this goal? (e.g., 2 years, 5 years, 10 years)\n2. Do you know the approximate cost or value required for this goal? If not, I can help you research it." };
}

if (questionNumber === 3) {
  // Financial Capacity Assessment
  return { message: "Thank you for sharing the timeline and cost information. Now let me ask about your current financial situation:\n\nWhat is your current monthly income and how much can you realistically allocate towards this goal each month?" };
}

if (questionNumber === 4) {
  // Risk Appetite Assessment
  return { message: "Now let me understand your investment preferences. How would you describe your risk appetite when it comes to investments? Are you:\n\n• Conservative (prefer safe, low-risk investments)\n• Moderate (comfortable with some risk for better returns)\n• Aggressive (willing to take higher risks for potentially higher returns)" };
}

if (questionNumber === 5) {
  // Profession & Income Sources
  return { message: "To provide you with the most relevant advice, could you tell me about your current profession and main sources of income? This helps me understand your earning potential and suggest appropriate investment strategies." };
}

if (questionNumber === 6) {
  // Existing Assets Assessment
  return { message: "Great! Now let me ask about your current financial situation. Do you have any existing savings, investments, or assets that you're currently working with?" };
}

if (questionNumber === 7) {
  // Final Details for Comprehensive Advice
  return { message: "Almost there! One final question to complete your financial profile: What is your current age and do you have any financial dependents (like children, elderly parents) that I should consider in your investment plan?" };
}
```

## 🔄 **Complete Enhanced User Flow:**

### **New 7-Question Flow:**
1. ✅ **Welcome & Life Goal Explanation** - Introduces Life Goal Preparedness concept
2. ✅ **Ready to Start** - Confirms user's readiness
3. ✅ **Name Collection** - Gets user's name for personalization
4. ✅ **Goal Sharing** - User describes inspirational life goal
5. ✅ **Timeline & Cost Analysis** - Target timeline and goal cost
6. ✅ **Financial Capacity** - Monthly income and investment allocation
7. ✅ **Risk Appetite** - Investment risk tolerance
8. ✅ **Profession & Income Sources** - Current profession and earning potential
9. ✅ **Existing Assets** - Current savings, investments, or assets
10. ✅ **Age & Dependents** - Age and financial dependents
11. ✅ **Comprehensive Analysis** - Goal cost, feasibility, investment strategy, alternatives

### **Enhanced Features:**
- **Goal Cost Research**: AI researches and provides cost estimates when needed
- **Risk Assessment**: Comprehensive risk appetite evaluation
- **Profession Analysis**: Understanding of income sources and earning potential
- **Asset Assessment**: Current financial position evaluation
- **Dependent Consideration**: Family and financial responsibility factors
- **Feasibility Calculation**: Mathematical assessment using all collected data

## 🎨 **Technical Implementation Details:**

### **1. Question Flow Logic:**
- **Special Handling**: Questions 2-7 have specific logic for comprehensive data collection
- **Dynamic Generation**: Uses structured questions for consistent data gathering
- **Context Awareness**: Each question builds on previous responses

### **2. AI Integration:**
- **Gemini API**: Uses Google's Gemini model for intelligent question generation
- **System Prompts**: Enhanced instructions for comprehensive financial analysis
- **Fallback Handling**: Robust fallback responses when API calls fail

### **3. Financial Calculations:**
- **Inflation Consideration**: Factors in 6% annual inflation for realistic planning
- **Market Returns**: Uses realistic ROI figures (12-15%* for equity, 7-8%* for debt)
- **Comprehensive Assessment**: Uses all 7 questions for accurate feasibility calculation

## 🧪 **Testing Scenarios:**

### **1. Complete 7-Question Flow:**
- ✅ User completes all 7 questions
- ✅ System provides comprehensive financial advice
- ✅ All collected data used for analysis

### **2. Risk Assessment:**
- ✅ User provides risk appetite (Conservative/Moderate/Aggressive)
- ✅ System tailors investment recommendations accordingly
- ✅ Portfolio allocation adjusted based on risk tolerance

### **3. Profession Analysis:**
- ✅ User shares profession and income sources
- ✅ System understands earning potential
- ✅ Investment strategies tailored to profession

### **4. Asset Assessment:**
- ✅ User shares existing savings/investments
- ✅ System considers current financial position
- ✅ Recommendations build on existing assets

### **5. Dependent Consideration:**
- ✅ User shares age and financial dependents
- ✅ System factors in family responsibilities
- ✅ Insurance and protection needs addressed

## 📋 **Files Modified:**

- `src/services/chatbotService.ts` - Updated question flow from 6 to 7 questions
- `SYSTEM_PROMPT_7_QUESTIONS_UPDATE.md` - Complete documentation of updates

## 🎉 **Status: ✅ UPDATED AND READY**

The chatbot now follows the new system prompt with:

- **7 Questions Maximum**: Comprehensive data collection before advice
- **Enhanced Question Structure**: Specific questions for each aspect of financial planning
- **Risk Assessment**: Dedicated risk appetite evaluation
- **Profession Analysis**: Understanding of income sources and earning potential
- **Asset Assessment**: Current financial position evaluation
- **Dependent Consideration**: Family and financial responsibility factors
- **Comprehensive Planning**: End-to-end financial analysis using all collected data

## 🚀 **Ready for Testing:**

Users can now:
1. **Complete 7 structured questions** for comprehensive financial planning
2. **Share risk preferences** for tailored investment recommendations
3. **Provide profession details** for income enhancement strategies
4. **Share asset information** for building on existing investments
5. **Include family considerations** for comprehensive planning
6. **Receive detailed analysis** based on complete financial profile

The InvestRight chatbot now provides comprehensive 7-question financial planning with enhanced data collection and analysis! 🎯
