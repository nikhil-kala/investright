// Test script to verify Gemini API connection for chatbot
// Run this with: node test-gemini-chatbot.js

// Load .env
try {
  require('dotenv').config();
} catch {}

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'your_api_key_here';

async function testGeminiChatbot() {
  if (API_KEY === 'your_api_key_here') {
    console.log('❌ Please set VITE_GEMINI_API_KEY environment variable');
    console.log('Example: export VITE_GEMINI_API_KEY="your_actual_key"');
    return;
  }

  const testMessage = 'What is compound interest?';
  
  const requestBody = {
    systemInstruction: {
      role: 'system',
      parts: [
        {
          text: 'You are an AI assistant for InvestRight, an investment platform. Provide concise, professional answers focused on investing and financial planning. If a question is unrelated to finance, politely redirect to investment topics.'
        }
      ]
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: testMessage
          }
        ]
      }
    ]
  };

  try {
    console.log('🧪 Testing Gemini API for chatbot...');
    console.log('📤 Sending request to:', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent');
    console.log('📝 Test message:', testMessage);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          console.log('🔍 Parsed error:', errorData.error);
        }
      } catch (e) {
        console.log('⚠️ Could not parse error response');
      }
    } else {
      const data = await response.json();
      console.log('✅ Success! API response:');
      console.log('📄 Response data:', JSON.stringify(data, null, 2));
      
      if (data.candidates && data.candidates.length > 0) {
        console.log('🤖 AI Response:', data.candidates[0].content.parts[0].text);
        console.log('🎉 Chatbot integration is working perfectly!');
      }
    }
    
  } catch (error) {
    console.log('💥 Network/other error:', error.message);
  }
}

testGeminiChatbot();
