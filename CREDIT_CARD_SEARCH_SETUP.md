# Credit Card Search Setup Guide

## Overview
The InvestRight application includes a comprehensive credit card search functionality that allows users to search for credit cards online and add them to their collection.

## Features
- ✅ **Real-time Internet Search** - Searches 50+ Indian banks for credit cards
- ✅ **Google Custom Search API Integration** - Uses Google's search API for accurate results
- ✅ **Bing Search API Fallback** - Alternative search provider
- ✅ **Progress Tracking** - Shows search progress with visual indicators
- ✅ **Card Selection & Addition** - Users can select and add cards to their collection
- ✅ **Comprehensive Bank Database** - Covers all major Indian banks

## How It Works

### 1. User Clicks "Add Credit Card" Button
- Opens the credit card search interface
- User enters card type (e.g., "simply save", "platinum", "gold")

### 2. Internet Search Process
- System searches 50+ Indian bank websites
- Uses Google Custom Search API for real-time results
- Falls back to Bing Search API if needed
- Shows progress indicator during search

### 3. Card Selection
- Displays matching credit cards with images
- Shows card details, benefits, fees, and eligibility
- User can select desired card

### 4. Card Addition
- Selected card is added to user's collection
- Prevents duplicate additions
- Shows success confirmation

## API Setup

### Google Custom Search API (Recommended)
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Go to [Google Custom Search Engine](https://cse.google.com/)
6. Create a new search engine
7. Add the following sites to search:
   - `hdfcbank.com`
   - `onlinesbi.com`
   - `icicibank.com`
   - `axisbank.com`
   - `kotak.com`
   - And other bank domains from the config

### Environment Variables
Create a `.env` file in the root directory:

```env
# Google Custom Search API
REACT_APP_GOOGLE_SEARCH_API_KEY=your_google_api_key_here
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Bing Search API (Optional)
REACT_APP_BING_SEARCH_API_KEY=your_bing_api_key_here
```

### Bing Search API (Alternative)
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new "Cognitive Services" resource
3. Select "Bing Search v7"
4. Get the API key from the resource

## Usage

### For Users
1. Click "Add Credit Card" button in the Card Manager
2. Enter card type (e.g., "simply save", "platinum", "gold")
3. Click "Search" to search the internet
4. Wait for search results (shows progress)
5. Select desired card from results
6. Click "Add Selected Card"

### For Developers
The search functionality is implemented in:
- `src/components/CardManager.tsx` - Main UI component
- `src/services/webSearchService.ts` - Search service logic
- `src/config/webSearchConfig.ts` - API configuration

## Search Capabilities

### Supported Banks (50+)
- **Public Sector**: SBI, PNB, Bank of Baroda, Canara Bank, etc.
- **Private Sector**: HDFC, ICICI, Axis, Kotak, IndusInd, etc.
- **Foreign Banks**: Citibank, HSBC, Standard Chartered, etc.
- **Regional Banks**: Karnataka Bank, TMB, City Union Bank, etc.

### Search Terms
- Card types: "simply save", "platinum", "gold", "millennia", "regalia"
- Bank names: "HDFC", "SBI", "ICICI", "Axis"
- Features: "cashback", "travel", "business", "student"

## Fallback System
1. **Tier 1**: Real-time web search using Google/Bing APIs
2. **Tier 2**: Comprehensive database search
3. **Tier 3**: AI-generated results
4. **Tier 4**: Default fallback results

## Technical Details

### Search Process
1. Generate search queries for all bank domains
2. Execute parallel API calls to Google/Bing
3. Parse search results to extract card information
4. Deduplicate and rank results
5. Cache results for 24 hours

### Card Information Extracted
- Card name and bank
- Card type (credit/debit)
- Description and benefits
- Fees and eligibility
- Card images
- Source URLs

## Troubleshooting

### No Search Results
- Check API credentials in environment variables
- Verify Google Custom Search Engine is configured
- Check network connectivity
- Review browser console for errors

### API Rate Limits
- Google: 100 queries/day (free tier)
- Bing: 1,000 queries/month (free tier)
- System includes delays between requests

### Search Quality
- Ensure search engine includes bank domains
- Use specific card type terms
- Check that bank websites are accessible

## Future Enhancements
- [ ] Add more international banks
- [ ] Implement card comparison features
- [ ] Add user reviews and ratings
- [ ] Integrate with bank APIs for real-time data
- [ ] Add card recommendation engine