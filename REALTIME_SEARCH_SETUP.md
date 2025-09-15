# Real-Time Credit Card Search Setup

This document explains how to set up real-time internet search for credit cards instead of using a static database.

## Overview

The credit card search has been converted to use real-time web search APIs to fetch live credit card information from bank websites. This ensures users always get the most up-to-date information.

## Features

- ✅ **Real-time Search**: Live search across 18+ major Indian bank websites
- ✅ **Multiple API Support**: Google Custom Search API and Bing Search API
- ✅ **Fallback System**: Falls back to comprehensive database if API fails
- ✅ **Error Handling**: Robust error handling and timeout management
- ✅ **Performance**: Optimized search queries and result parsing

## Setup Instructions

### 1. Google Custom Search API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Create a Custom Search Engine at [Google Custom Search](https://cse.google.com/)
6. Configure the search engine to search specific bank websites

### 2. Environment Variables

Create a `.env` file in your project root with:

```env
# Google Custom Search API
REACT_APP_GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id_here

# Bing Search API (Alternative)
REACT_APP_BING_SEARCH_API_KEY=your_bing_search_api_key_here
```

### 3. API Configuration

The search is configured in `src/config/webSearchConfig.ts`:

```typescript
export const GOOGLE_SEARCH_CONFIG: WebSearchConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_SEARCH_API_KEY || '',
  searchEngineId: process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID || '',
  baseUrl: 'https://www.googleapis.com/customsearch/v1',
  maxResults: 10,
  timeout: 10000
};
```

## How It Works

### 1. Search Process

1. User enters search term (e.g., "simply save")
2. System generates search queries for all bank domains
3. Executes real-time web search API calls
4. Parses search results to extract credit card information
5. Returns live results from bank websites

### 2. Search Queries

The system creates targeted search queries like:
- `"simply save" credit card site:hdfcbank.com`
- `"simply save" credit card site:onlinesbi.com`
- `"simply save" credit card site:icicibank.com`
- And 15+ more bank domains

### 3. Result Parsing

Search results are parsed to extract:
- Card name
- Bank name
- Card type (credit/debit)
- Description from search snippet
- Source URL

### 4. Fallback System

If the real-time search fails:
1. Falls back to comprehensive database (65+ cards)
2. Shows error message to user
3. Logs error for debugging

## Bank Coverage

The real-time search covers 18+ major Indian banks:

- HDFC Bank
- State Bank of India
- ICICI Bank
- Axis Bank
- Kotak Mahindra Bank
- Punjab National Bank
- Bank of Baroda
- Canara Bank
- Union Bank of India
- Indian Bank
- Bank of India
- Central Bank of India
- IDBI Bank
- Yes Bank
- IndusInd Bank
- Federal Bank
- South Indian Bank
- Karur Vysya Bank

## API Costs

### Google Custom Search API
- Free tier: 100 searches per day
- Paid: $5 per 1,000 queries

### Bing Search API
- Free tier: 1,000 searches per month
- Paid: $5 per 1,000 queries

## Performance Optimization

1. **Parallel Search**: Multiple bank domains searched simultaneously
2. **Timeout Management**: 10-second timeout per API call
3. **Result Caching**: Results cached for 5 minutes
4. **Error Handling**: Graceful degradation on API failures

## Testing

To test the real-time search:

1. Set up API credentials
2. Start the application
3. Go to Dashboard > Card Management
4. Click "Add Credit Card"
5. Enter search term (e.g., "simply save")
6. Click "Search"
7. Verify real-time results appear

## Troubleshooting

### Common Issues

1. **No Results**: Check API credentials and search engine configuration
2. **Slow Search**: Check network connection and API quotas
3. **API Errors**: Verify API keys and billing setup
4. **Fallback Not Working**: Check database configuration

### Debug Mode

Enable debug logging by adding to console:
```javascript
localStorage.setItem('debug', 'webSearch');
```

## Future Enhancements

1. **Result Caching**: Implement Redis caching for better performance
2. **Machine Learning**: Use ML to improve result parsing
3. **More APIs**: Add support for additional search APIs
4. **Real-time Updates**: WebSocket updates for new cards
5. **Analytics**: Track search patterns and popular cards

## Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate search terms to prevent injection
4. **HTTPS Only**: Ensure all API calls use HTTPS

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify environment variables are set correctly
