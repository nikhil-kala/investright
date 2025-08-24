// Test script for conversation flow logic - Updated for 6 Questions
console.log('🧪 Testing Conversation Flow Logic (6 Questions Version)...\n');

// Mock conversation history for testing based on the system prompt
const testConversations = [
  // First message - Welcome
  [],
  
  // Second message - User says "yes"
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' }
  ],
  
  // Third message - User provides name
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' }
  ],
  
  // Fourth message - Ask for name
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' },
    { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." }
  ],
  
  // Fifth message - Ask for life goal
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' },
    { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." },
    { role: 'user', content: 'John' }
  ],
  
  // Sixth message - Ask for life goal
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' },
    { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." },
    { role: 'user', content: 'John' },
    { role: 'assistant', content: 'Nice to meet you, John! What inspirational life goal do you have?' }
  ],
  
  // Seventh message - User provides goal (start follow-up questions)
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' },
    { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." },
    { role: 'user', content: 'John' },
    { role: 'assistant', content: 'Nice to meet you, John! What inspirational life goal do you have?' },
    { role: 'user', content: 'I want to buy a house in 5 years' }
  ],
  
  // Eighth message - Generate relevant follow-up question 1
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' },
    { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." },
    { role: 'user', content: 'John' },
    { role: 'assistant', content: 'Nice to meet you, John! What inspirational life goal do you have?' },
    { role: 'user', content: 'I want to buy a house in 5 years' },
    { role: 'assistant', content: 'John, what is your target timeline for achieving this goal?' }
  ],
  
  // Continue adding messages until 12 total (6 questions)
  [
    { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
    { role: 'user', content: 'yes' },
    { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." },
    { role: 'user', content: 'John' },
    { role: 'assistant', content: 'Nice to meet you, John! What inspirational life goal do you have?' },
    { role: 'user', content: 'I want to buy a house in 5 years' },
    { role: 'assistant', content: 'John, what is your target timeline for achieving this goal?' },
    { role: 'user', content: '5 years' },
    { role: 'assistant', content: 'John, what is your current monthly income and how much can you allocate for investments?' },
    { role: 'user', content: '₹80,000 per month, can invest ₹20,000' },
    { role: 'assistant', content: 'John, do you have any existing savings or investments for this goal?' },
    { role: 'user', content: 'I have ₹2 lakh in savings' }
  ]
];

// Test the conversation flow logic
function testConversationFlow() {
  console.log('📋 Testing conversation flow logic based on 6 Questions System...\n');
  
  testConversations.forEach((conversation, index) => {
    console.log(`--- Test Case ${index + 1}: ${conversation.length} messages ---`);
    console.log('Conversation length:', conversation.length);
    
    if (conversation.length === 0) {
      console.log('Expected: Welcome message + Life goal explanation + Start question');
    } else if (conversation.length === 1) {
      console.log('Expected: Ask for name (if user said yes/ready) or ask to be ready');
    } else if (conversation.length === 2) {
      console.log('Expected: Ask for name');
    } else if (conversation.length === 3) {
      console.log('Expected: Ask for life goal');
    } else if (conversation.length >= 4 && conversation.length < 12) {
      const questionNumber = Math.floor((conversation.length - 4) / 2) + 2;
      console.log(`Expected: Generate relevant follow-up question ${questionNumber} of 6`);
    } else if (conversation.length >= 12) {
      console.log('Expected: Generate comprehensive financial advice (after 6 questions)');
    }
    
    // Extract user name if available
    let userName = '';
    if (conversation.length >= 4) {
      const nameMessage = conversation[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
        console.log('User name extracted from position 3:', userName);
      }
    }
    
    console.log('User name available:', userName || 'None');
    console.log('');
  });
}

// Test the logic
testConversationFlow();

console.log('✅ Conversation flow logic test completed!');
console.log('\n📋 Flow Summary (6 Questions Version):');
console.log('0 messages → Welcome + Explanation + Start question');
console.log('1 message → Check if ready, ask for name if yes');
console.log('2 messages → Ask for name');
console.log('3 messages → Ask for life goal');
console.log('4-11 messages → Generate relevant follow-up questions (4 more questions)');
console.log('12+ messages → Generate comprehensive financial advice');
console.log('\n🎯 Key Features:');
console.log('- Total of 6 questions before financial advice');
console.log('- AI-generated relevant follow-up questions based on user goal');
console.log('- Personalized questions addressing specific financial aspects');
console.log('- Comprehensive financial plan after collecting all information');
console.log('- Fallback questions if AI generation fails');
console.log('\n🚀 Ready for testing with updated 6-question flow!');