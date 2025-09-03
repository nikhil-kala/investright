// Test script for enhanced financial chatbot
const { testFinancialAdviceGeneration, testFiveQuestionFlow, testIndianNumberConversion, testAdaptiveQuestioning, testMultipleGoals } = require('./src/services/chatbotService.ts');

console.log('🧪 Testing Enhanced Financial Chatbot...\n');

// Test 1: Indian number conversion
console.log('📊 Test 1: Indian Number Conversion');
testIndianNumberConversion();
console.log('\n');

// Test 2: Financial advice generation
console.log('💰 Test 2: Financial Advice Generation');
testFinancialAdviceGeneration()
  .then(result => {
    console.log('✅ Financial advice generation test completed');
    console.log('Success:', result.success);
    console.log('Message length:', result.message?.length || 0);
    if (result.message) {
      console.log('First 200 chars:', result.message.substring(0, 200));
      console.log('Last 200 chars:', result.message.substring(result.message.length - 200));
    }
  })
  .catch(error => {
    console.error('❌ Financial advice generation test failed:', error);
  });

// Test 3: 5-question flow
console.log('\n🎯 Test 3: 5-Question Flow');
testFiveQuestionFlow()
  .then(result => {
    console.log('✅ 5-question flow test completed');
    console.log('Success:', result.success);
    console.log('Message length:', result.message?.length || 0);
    if (result.message) {
      console.log('First 200 chars:', result.message.substring(0, 200));
      console.log('Last 200 chars:', result.message.substring(result.message.length - 200));
    }
  })
  .catch(error => {
    console.error('❌ 5-question flow test failed:', error);
  });

// Test 4: Adaptive questioning for complex scenarios
console.log('\n🔄 Test 4: Adaptive Questioning - Complex Scenario');
testAdaptiveQuestioning()
  .then(result => {
    console.log('✅ Adaptive questioning test completed');
    console.log('Success:', result.success);
    console.log('Message length:', result.message?.length || 0);
    if (result.message) {
      console.log('First 200 chars:', result.message.substring(0, 200));
      console.log('Last 200 chars:', result.message.substring(result.message.length - 200));
    }
  })
  .catch(error => {
    console.error('❌ Adaptive questioning test failed:', error);
  });

// Test 5: Multiple goals scenario
console.log('\n🎯 Test 5: Multiple Goals Scenario');
testMultipleGoals()
  .then(result => {
    console.log('✅ Multiple goals test completed');
    console.log('Success:', result.success);
    console.log('Message length:', result.message?.length || 0);
    if (result.message) {
      console.log('First 200 chars:', result.message.substring(0, 200));
      console.log('Last 200 chars:', result.message.substring(result.message.length - 200));
    }
  })
  .catch(error => {
    console.error('❌ Multiple goals test failed:', error);
  });

console.log('\n🚀 All tests initiated. Check the console for results.');
