import React, { useState, useEffect } from 'react';
import { Search, Plus, CreditCard, Trash2, AlertCircle, CheckCircle, Loader2, Globe, ExternalLink } from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  bank: string;
  lastFourDigits: string;
  expiryDate: string;
  cardholderName: string;
  addedDate: Date;
}

interface CardSearchResult {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  bank: string;
  lastFourDigits: string;
  expiryDate: string;
  cardholderName: string;
  description: string;
  fees?: string;
  benefits?: string[];
  source?: string;
  searchUrl?: string;
  snippet?: string;
}

interface SearchProgress {
  completed: number;
  total: number;
  currentBank: string;
  status: 'searching' | 'parsing' | 'completed' | 'error';
}

// Enhanced WebSearchService with error handling
class SafeWebSearchService {
  private webSearchService: any = null;
  private isInitialized = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      const { WebSearchService } = await import('../services/webSearchService');
      this.webSearchService = new WebSearchService();
      this.isInitialized = true;
      console.log('✅ WebSearchService loaded successfully');
    } catch (error) {
      console.error('❌ Error loading WebSearchService:', error);
      this.isInitialized = false;
    }
  }

  async searchCreditCards(searchTerm: string, onProgress?: (progress: SearchProgress) => void): Promise<CardSearchResult[]> {
    if (!this.isInitialized || !this.webSearchService) {
      console.log('WebSearchService not available, using mock data');
      return this.getMockResults(searchTerm, onProgress);
    }

    try {
      return await this.webSearchService.searchCreditCards(searchTerm, onProgress);
    } catch (error) {
      console.error('Error in web search, falling back to mock data:', error);
      return this.getMockResults(searchTerm, onProgress);
    }
  }

  private async getMockResults(searchTerm: string, onProgress?: (progress: SearchProgress) => void): Promise<CardSearchResult[]> {
    // Simulate progress
    if (onProgress) {
      onProgress({ completed: 0, total: 3, currentBank: 'HDFC Bank', status: 'searching' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onProgress({ completed: 1, total: 3, currentBank: 'SBI', status: 'searching' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onProgress({ completed: 2, total: 3, currentBank: 'ICICI Bank', status: 'searching' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onProgress({ completed: 3, total: 3, currentBank: '', status: 'parsing' });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onProgress({ completed: 3, total: 3, currentBank: '', status: 'completed' });
    }

    // Return mock results based on search term
    const mockResults: CardSearchResult[] = [
      {
        id: '1',
        name: `${searchTerm} Credit Card`,
        type: 'credit',
        bank: 'HDFC Bank',
        lastFourDigits: '1234',
        expiryDate: '12/26',
        cardholderName: 'Your Name',
        description: `Premium ${searchTerm} credit card with exclusive benefits and rewards`,
        fees: '₹2,000 annually',
        benefits: ['Reward points', 'Fuel surcharge waiver', 'Airport lounge access'],
        source: 'mock',
        searchUrl: 'https://hdfcbank.com',
        snippet: `Discover the ${searchTerm} credit card with amazing benefits...`
      },
      {
        id: '2',
        name: `${searchTerm} Platinum Card`,
        type: 'credit',
        bank: 'State Bank of India',
        lastFourDigits: '5678',
        expiryDate: '08/25',
        cardholderName: 'Your Name',
        description: `SBI ${searchTerm} platinum card with high reward rates and exclusive benefits`,
        fees: '₹1,500 annually',
        benefits: ['4X reward points', 'Airport lounge access', 'Fuel surcharge waiver'],
        source: 'mock',
        searchUrl: 'https://onlinesbi.com',
        snippet: `SBI ${searchTerm} platinum card offers premium benefits...`
      },
      {
        id: '3',
        name: `${searchTerm} Gold Card`,
        type: 'credit',
        bank: 'ICICI Bank',
        lastFourDigits: '9012',
        expiryDate: '06/27',
        cardholderName: 'Your Name',
        description: `ICICI ${searchTerm} gold card with reward points and fuel surcharge waiver`,
        fees: '₹1,000 annually',
        benefits: ['Reward points', 'Fuel surcharge waiver', 'Online shopping benefits'],
        source: 'mock',
        searchUrl: 'https://icicibank.com',
        snippet: `ICICI ${searchTerm} gold card provides excellent value...`
      }
    ];

    return mockResults;
  }
}

// Initialize the safe web search service
const safeWebSearchService = new SafeWebSearchService();

export default function CardManagerWithWebSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bankName, setBankName] = useState('');
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([]);
  const [addedCards, setAddedCards] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchProgress, setSearchProgress] = useState<SearchProgress | null>(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  // Load saved cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem('userCards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        const cardsWithDates = parsedCards.map((card: any) => ({
          ...card,
          addedDate: new Date(card.addedDate)
        }));
        setAddedCards(cardsWithDates);
      } catch (error) {
        console.error('Error parsing saved cards:', error);
      }
    }
  }, []);

  // Save cards to localStorage whenever addedCards changes
  useEffect(() => {
    localStorage.setItem('userCards', JSON.stringify(addedCards));
  }, [addedCards]);

  const handleWebSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !bankName.trim()) {
      alert('Please enter both bank name and card name');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSearchProgress(null);
    
    try {
      const fullSearchTerm = `${bankName} ${searchTerm}`;
      console.log('Searching for:', fullSearchTerm);
      
      const results = await safeWebSearchService.searchCreditCards(fullSearchTerm, (progress: SearchProgress) => {
        setSearchProgress(progress);
      });
      
      setSearchResults(results);
      console.log('Search results:', results);
    } catch (error) {
      console.error('Error searching for credit cards:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCard = (card: CardSearchResult) => {
    const newCard: Card = {
      id: Date.now().toString(),
      name: card.name,
      type: card.type,
      bank: card.bank,
      lastFourDigits: card.lastFourDigits,
      expiryDate: card.expiryDate,
      cardholderName: card.cardholderName,
      addedDate: new Date()
    };

    setAddedCards(prev => [...prev, newCard]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleRemoveCard = (cardId: string) => {
    setAddedCards(prev => prev.filter(card => card.id !== cardId));
  };

  const formatCardNumber = (lastFour: string) => `**** **** **** ${lastFour}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getCardTypeColor = (type: string) => {
    return type === 'credit' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'real-time-search':
        return 'bg-green-100 text-green-800';
      case 'cached':
        return 'bg-yellow-100 text-yellow-800';
      case 'database':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
        Credit Card Manager
      </h3>
      
      {/* Debug indicator */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
        ✅ Credit Card Manager with Web Search is loaded and visible for all users
      </div>

      {/* Add New Card Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddCardForm(!showAddCardForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showAddCardForm ? 'Cancel' : 'Add New Credit Card'}
        </button>
      </div>

      {/* Add Card Form */}
      {showAddCardForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-4 w-4 text-blue-600 mr-2" />
            Search Credit Cards Online
          </h4>
          
          <form onSubmit={handleWebSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., HDFC, SBI, ICICI, Axis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Name
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., Simply Save, Platinum, Coral..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isSearching ? 'Searching...' : 'Search Online'}
            </button>
          </form>

          {/* Search Progress */}
          {searchProgress && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  {searchProgress.status === 'searching' ? 'Searching...' : 
                   searchProgress.status === 'parsing' ? 'Processing results...' : 
                   searchProgress.status === 'completed' ? 'Search completed!' : 'Error occurred'}
                </span>
                <span className="text-sm text-blue-600">
                  {searchProgress.completed}/{searchProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(searchProgress.completed / searchProgress.total) * 100}%` }}
                ></div>
              </div>
              {searchProgress.currentBank && (
                <p className="text-xs text-blue-600 mt-1">
                  Currently searching: {searchProgress.currentBank}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Card added successfully!
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <Globe className="h-4 w-4 text-green-600 mr-2" />
            Search Results ({searchResults.length})
          </h4>
          <div className="grid gap-4">
            {searchResults.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-gray-900">{card.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${getSourceColor(card.source || 'mock')}`}>
                        {card.source || 'mock'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span>Bank: {card.bank}</span>
                      <span>Fees: {card.fees}</span>
                    </div>
                    {card.benefits && card.benefits.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">Benefits: </span>
                        <span className="text-xs text-blue-600">{card.benefits.join(', ')}</span>
                      </div>
                    )}
                    {card.searchUrl && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <ExternalLink className="h-3 w-3" />
                        <a href={card.searchUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View on bank website
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddCard(card)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added Cards */}
      {addedCards.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Your Credit Cards ({addedCards.length})</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {addedCards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-gray-900">{card.name}</h5>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Card Number:</span>
                    <span className="font-mono">{formatCardNumber(card.lastFourDigits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry:</span>
                    <span>{card.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cardholder:</span>
                    <span>{card.cardholderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Added:</span>
                    <span>{formatDate(card.addedDate)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCardTypeColor(card.type)}`}>
                    {card.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {addedCards.length === 0 && searchResults.length === 0 && !showAddCardForm && (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No credit cards added yet</p>
          <p className="text-sm text-gray-400">Click "Add New Credit Card" to search and add cards</p>
        </div>
      )}
    </div>
  );
}
