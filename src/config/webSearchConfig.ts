// Web Search API Configuration for Real-time Credit Card Search

export interface WebSearchConfig {
  apiKey: string;
  searchEngineId: string;
  baseUrl: string;
  maxResults: number;
  timeout: number;
}

// Google Custom Search API Configuration
export const GOOGLE_SEARCH_CONFIG: WebSearchConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '',
  searchEngineId: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
  baseUrl: 'https://www.googleapis.com/customsearch/v1',
  maxResults: 10,
  timeout: 10000
};

// Bing Search API Configuration (Alternative)
export const BING_SEARCH_CONFIG: WebSearchConfig = {
  apiKey: import.meta.env.VITE_BING_SEARCH_API_KEY || '',
  searchEngineId: '',
  baseUrl: 'https://api.bing.microsoft.com/v7.0/search',
  maxResults: 10,
  timeout: 10000
};

// Comprehensive Bank Website Domains for Targeted Search (50+ Banks)
export const BANK_DOMAINS = [
  // Public Sector Banks
  'onlinesbi.com', 'pnb.co.in', 'bankofbaroda.in', 'canarabank.com',
  'unionbankofindia.co.in', 'indianbank.in', 'bankofindia.co.in',
  'centralbankofindia.co.in', 'idbi.co.in', 'iob.in',
  
  // Private Sector Banks
  'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotak.com',
  'indusind.com', 'yesbank.in', 'federalbank.co.in', 'southindianbank.com',
  'karurvysyabank.com', 'rblbank.com', 'bandhanbank.com',
  
  // Foreign Banks
  'citibank.co.in', 'hsbc.co.in', 'standardchartered.co.in',
  'deutschebank.co.in', 'dbs.com', 'dhanlaxmibank.com',
  
  // Regional Banks
  'karnatakabank.com', 'tmb.in', 'cityunionbank.com',
  'lakshmivilasbank.com', 'jandkbank.com', 'andhrabank.co.in',
  
  // Co-operative Banks
  'saraswatbank.com', 'cosmosbank.com', 'dcb.co.in',
  'janalakshmi.com', 'equitasbank.com', 'utkarshbank.com'
];

// Bank-specific search strategies for better targeting
export const BANK_SEARCH_STRATEGIES = {
  'hdfcbank.com': {
    cardPagePattern: '/personal/cards/credit-cards/',
    searchTerms: ['credit card', 'debit card', 'platinum', 'gold', 'millennia', 'regalia', 'simply save'],
    specificPages: ['/simply-save', '/regalia', '/diners-club', '/millennia', '/coral']
  },
  'onlinesbi.com': {
    cardPagePattern: '/personal/cards/',
    searchTerms: ['credit card', 'debit card', 'simplyclick', 'prime', 'elite', 'cashback'],
    specificPages: ['/simplyclick', '/prime', '/elite', '/cashback']
  },
  'icicibank.com': {
    cardPagePattern: '/personal/cards/credit-cards/',
    searchTerms: ['credit card', 'debit card', 'platinum', 'gold', 'coral', 'ruby'],
    specificPages: ['/coral', '/ruby', '/platinum', '/gold']
  },
  'axisbank.com': {
    cardPagePattern: '/personal/cards/credit-cards/',
    searchTerms: ['credit card', 'debit card', 'my zone', 'ace', 'flipkart'],
    specificPages: ['/my-zone', '/ace', '/flipkart', '/my-choice']
  },
  'kotak.com': {
    cardPagePattern: '/personal/cards/',
    searchTerms: ['credit card', 'debit card', 'royal', 'white', 'pvr'],
    specificPages: ['/royal', '/white', '/pvr', '/league']
  },
  'pnb.co.in': {
    cardPagePattern: '/personal/cards/',
    searchTerms: ['credit card', 'debit card', 'platinum', 'gold', 'rupay'],
    specificPages: ['/platinum', '/gold', '/rupay']
  }
};

// Search Query Templates
export const SEARCH_QUERY_TEMPLATES = {
  CREDIT_CARD: '"{searchTerm}" credit card site:{domain}',
  DEBIT_CARD: '"{searchTerm}" debit card site:{domain}',
  BANK_CARD: '"{searchTerm}" card site:{domain}',
  GENERAL: '"{searchTerm}" site:{domain}'
};

// Real-time Search API Functions
export class WebSearchAPI {
  private config: WebSearchConfig;

  constructor(config: WebSearchConfig) {
    this.config = config;
  }

  // Generate search queries for all bank domains
  generateSearchQueries(searchTerm: string, queryTemplate: string = SEARCH_QUERY_TEMPLATES.CREDIT_CARD): string[] {
    return BANK_DOMAINS.map(domain => 
      queryTemplate.replace('{searchTerm}', searchTerm).replace('{domain}', domain)
    );
  }

  // Execute Google Custom Search API call
  async searchGoogle(query: string): Promise<any> {
    if (!this.config.apiKey || !this.config.searchEngineId) {
      throw new Error('Google Search API credentials not configured');
    }

    const url = new URL(this.config.baseUrl);
    url.searchParams.append('key', this.config.apiKey);
    url.searchParams.append('cx', this.config.searchEngineId);
    url.searchParams.append('q', query);
    url.searchParams.append('num', this.config.maxResults.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Execute Bing Search API call
  async searchBing(query: string): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('Bing Search API credentials not configured');
    }

    const url = new URL(this.config.baseUrl);
    url.searchParams.append('q', query);
    url.searchParams.append('count', this.config.maxResults.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`Bing Search API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Parse search results to extract credit card information
  parseSearchResults(searchResults: any, searchTerm: string): any[] {
    const results: any[] = [];
    
    if (searchResults.items) {
      searchResults.items.forEach((item: any, index: number) => {
        // Extract credit card information from search result
        const cardInfo = this.extractCardInfo(item, searchTerm);
        if (cardInfo) {
          results.push({
            id: `search-${index}`,
            ...cardInfo,
            source: 'real-time-search',
            searchUrl: item.link,
            snippet: item.snippet
          });
        }
      });
    }
    
    return results;
  }

  // Extract credit card information from search result
  private extractCardInfo(item: any, searchTerm: string): any | null {
    const title = item.title || '';
    const snippet = item.snippet || '';
    const link = item.link || '';
    
    // Check if this is a credit card related result
    if (this.isCreditCardResult(title, snippet, link)) {
      return {
        name: this.extractCardName(title, snippet),
        bank: this.extractBankName(link, title),
        type: 'credit',
        lastFourDigits: '****',
        expiryDate: '12/26',
        cardholderName: 'Your Name',
        description: snippet.substring(0, 200) + '...',
        url: link
      };
    }
    
    return null;
  }

  // Check if search result is credit card related
  private isCreditCardResult(title: string, snippet: string, link: string): boolean {
    const creditCardKeywords = [
      'credit card', 'debit card', 'card', 'simply save', 'platinum', 'gold',
      'millennia', 'regalia', 'coral', 'moneyback', 'business', 'student'
    ];
    
    const text = `${title} ${snippet} ${link}`.toLowerCase();
    return creditCardKeywords.some(keyword => text.includes(keyword));
  }

  // Extract card name from title or snippet
  private extractCardName(title: string, snippet: string): string {
    // Try to extract card name from title first
    const titleMatch = title.match(/([A-Za-z\s]+(?:Credit|Debit)\s+Card)/i);
    if (titleMatch) {
      return titleMatch[1];
    }
    
    // Fallback to snippet
    const snippetMatch = snippet.match(/([A-Za-z\s]+(?:Credit|Debit)\s+Card)/i);
    if (snippetMatch) {
      return snippetMatch[1];
    }
    
    return title;
  }

  // Extract bank name from URL or title
  private extractBankName(link: string, title: string): string {
    const bankMappings: { [key: string]: string } = {
      'hdfcbank.com': 'HDFC Bank',
      'onlinesbi.com': 'State Bank of India',
      'icicibank.com': 'ICICI Bank',
      'axisbank.com': 'Axis Bank',
      'kotak.com': 'Kotak Mahindra Bank',
      'pnb.co.in': 'Punjab National Bank',
      'bankofbaroda.in': 'Bank of Baroda',
      'canarabank.com': 'Canara Bank',
      'unionbankofindia.co.in': 'Union Bank of India',
      'indianbank.in': 'Indian Bank',
      'bankofindia.co.in': 'Bank of India',
      'centralbankofindia.co.in': 'Central Bank of India',
      'idbi.co.in': 'IDBI Bank',
      'yesbank.in': 'Yes Bank',
      'indusind.com': 'IndusInd Bank',
      'federalbank.co.in': 'Federal Bank',
      'southindianbank.com': 'South Indian Bank',
      'karurvysyabank.com': 'Karur Vysya Bank'
    };
    
    for (const [domain, bankName] of Object.entries(bankMappings)) {
      if (link.includes(domain)) {
        return bankName;
      }
    }
    
    // Fallback to extracting from title
    const titleMatch = title.match(/([A-Za-z\s]+Bank)/i);
    return titleMatch ? titleMatch[1] : 'Unknown Bank';
  }
}

// Export default Google Search API instance
export const webSearchAPI = new WebSearchAPI(GOOGLE_SEARCH_CONFIG);
