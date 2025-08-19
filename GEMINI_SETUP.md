# Google Gemini API Setup

This application now integrates with Google's Gemini AI API to process contact form submissions.

## Setup Instructions

### 1. Get Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables
1. Create a `.env` file in the root directory of your project
2. Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with the API key you copied

### 3. Restart Development Server
After adding the `.env` file, restart your development server:
```bash
npm run dev
```

## How It Works

### Chatbot Integration
When a user sends a message in the chatbot:
1. The user's message is sent to Google's Gemini AI API
2. Gemini generates a context-aware response related to investing and financial planning
3. The AI response is displayed in the chat interface
4. The chatbot maintains conversation history and provides real-time assistance

### Contact Form
The contact form now uses a simple form submission without AI integration.

## Security Notes

- Never commit your `.env` file to version control
- The API key is only used on the client side (Vite will replace `import.meta.env.VITE_GEMINI_API_KEY` with the actual value during build)
- Consider implementing rate limiting for production use

## Troubleshooting

- **"API key not found"**: Make sure your `.env` file exists and contains the correct variable name
- **"HTTP error"**: Check if your API key is valid and has the necessary permissions
- **"No response generated"**: The Gemini API might be experiencing issues, try again later

### Common HTTP 400 Errors

If you're getting HTTP 400 errors:

1. **Check API Key**: Ensure your API key is valid and active
2. **Model Name**: We're using `gemini-1.5-flash` which is the current stable model
3. **Rate Limits**: Check if you've exceeded API quotas
4. **Test Connection**: Use the provided test script to verify API connectivity

### Testing Your API Connection

Run this command to test your API key:
```bash
# Set your API key
export VITE_GEMINI_API_KEY="your_actual_api_key"

# Test the connection
node test-gemini-api.js
```

This will help identify if the issue is with your API key, the endpoint, or the request format.
