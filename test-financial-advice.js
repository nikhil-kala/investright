// Test script for financial advice generation
console.log('🧪 Testing Financial Advice Generation...\n');

// Mock conversation history for testing
const mockConversationHistory = [
  { role: 'assistant', content: 'Hi there, Welcome to InvestRight... Are you ready to start?' },
  { role: 'user', content: 'yes' },
  { role: 'assistant', content: "What's your name? I'd love to address you personally throughout our conversation." },
  { role: 'user', content: 'John' },
  { role: 'assistant', content: 'Nice to meet you, John! What inspirational life goal do you have?' },
  { role: 'user', content: 'I want to buy a house in 5 years' }
];

// Test the conversation flow logic
function testConversationFlow() {
  console.log('📋 Testing conversation flow...\n');
  
  console.log('Conversation length:', mockConversationHistory.length);
  console.log('Expected behavior: Generate financial advice (after 4+ messages)');
  
  // Debug: Show all messages
  console.log('\n📝 Full conversation:');
  mockConversationHistory.forEach((msg, index) => {
    console.log(`${index}: ${msg.role} - ${msg.content}`);
  });
  
  // Extract user name - look for the name in the conversation
  let userName = '';
  for (let i = 0; i < mockConversationHistory.length; i++) {
    const message = mockConversationHistory[i];
    if (message.role === 'user' && i === 3) { // Fourth message (index 3) should be the name
      userName = message.content.trim();
      console.log('\n👤 User name extracted from position 3:', userName);
      break;
    }
  }
  
  // Check if we should generate financial advice
  if (mockConversationHistory.length >= 4) {
    console.log('\n✅ Should generate financial advice');
    console.log('User name available:', userName || 'None');
    console.log('User goal:', mockConversationHistory[mockConversationHistory.length - 1].content);
  } else {
    console.log('\n❌ Not enough messages for financial advice');
  }
  
  console.log('');
}

// Test the logic
testConversationFlow();

console.log('✅ Financial advice generation test completed!');
console.log('\n📋 Test Summary:');
console.log('- Conversation length: 6 messages');
console.log('- User name: John');
console.log('- User goal: Buy a house in 5 years');
console.log('- Expected: Generate comprehensive financial advice');
console.log('\n🚀 Ready for testing with the chatbot!');
