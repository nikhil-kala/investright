// Simple test script to verify Gemini API connection
// Run this with: node test-gemini-api.js

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'your_api_key_here';

async function testGeminiAPI() {
  if (API_KEY === 'your_api_key_here') {
    console.log('❌ Please set VITE_GEMINI_API_KEY environment variable');
    console.log('Example: export VITE_GEMINI_API_KEY="your_actual_key"');
    return;
  }

  const testMessage = 'Hello, can you explain what compound interest is?';
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: testMessage
          }
        ]
      }
    ]
  };

  try {
    console.log('🧪 Testing Gemini API connection...');
    console.log('📤 Sending request to:', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
    console.log('📝 Test message:', testMessage);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      }
    }
    
  } catch (error) {
    console.log('💥 Network/other error:', error.message);
  }
}

testGeminiAPI();
