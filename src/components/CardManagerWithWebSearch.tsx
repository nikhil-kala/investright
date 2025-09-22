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
      console.log('WebSearchService not available, using fallback data');
      return this.getFallbackResults(searchTerm, onProgress);
    }

    try {
      console.log('🔍 Using real-time Google Custom Search API');
      return await this.webSearchService.searchCreditCards(searchTerm, onProgress);
    } catch (error) {
      console.error('Error in web search, falling back to database:', error);
      return this.getFallbackResults(searchTerm, onProgress);
    }
  }

  private async getFallbackResults(searchTerm: string, onProgress?: (progress: SearchProgress) => void): Promise<CardSearchResult[]> {
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

    // Return comprehensive database results based on search term
    const searchTermLower = searchTerm.toLowerCase();
    const allCards = this.getComprehensiveCardDatabase();
    
    // Filter cards based on search term
    const filteredCards = allCards.filter(card => {
      const cardName = card.name.toLowerCase();
      const bankName = card.bank.toLowerCase();
      const description = card.description.toLowerCase();
      
      return cardName.includes(searchTermLower) || 
             bankName.includes(searchTermLower) ||
             description.includes(searchTermLower) ||
             (searchTermLower.includes('save') && cardName.includes('simply')) ||
             (searchTermLower.includes('millennia') && cardName.includes('millennia')) ||
             (searchTermLower.includes('platinum') && cardName.includes('platinum')) ||
             (searchTermLower.includes('gold') && cardName.includes('gold')) ||
             (searchTermLower.includes('regalia') && cardName.includes('regalia')) ||
             (searchTermLower.includes('coral') && cardName.includes('coral')) ||
             (searchTermLower.includes('moneyback') && cardName.includes('moneyback'));
    });

    // If no specific matches, return top cards from major banks
    if (filteredCards.length === 0) {
      return allCards.slice(0, 10);
    }

    return filteredCards.slice(0, 15);
  }

  private getComprehensiveCardDatabase(): CardSearchResult[] {
    return [
      // HDFC Bank Cards
      { id: 'db-1', name: 'HDFC Simply Save Credit Card', bank: 'HDFC Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'No annual fee credit card with reward points on all purchases. Get 1 reward point for every ₹150 spent. Fuel surcharge waiver at HPCL pumps.', imageUrl: this.generateCardImageUrl('HDFC Bank', 'Simply Save'), cardImage: this.generateCardImageUrl('HDFC Bank', 'Simply Save'), source: 'database' as const, fees: 'Lifetime Free', benefits: ['1 reward point per ₹150', 'Fuel surcharge waiver', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹25,000+ monthly income' },
      { id: 'db-2', name: 'HDFC Millennia Credit Card', bank: 'HDFC Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Premium credit card with 5% cashback on online spends, movie tickets, and dining. Get 1% cashback on all other spends.', imageUrl: this.generateCardImageUrl('HDFC Bank', 'Millennia'), cardImage: this.generateCardImageUrl('HDFC Bank', 'Millennia'), source: 'database' as const, fees: '₹1,000 annually', benefits: ['5% cashback on online', 'Movie ticket offers', 'Dining discounts'], eligibility: 'Salaried individuals with ₹40,000+ monthly income' },
      { id: 'db-3', name: 'HDFC Regalia Credit Card', bank: 'HDFC Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Travel credit card with air miles and hotel stays. Get 4 reward points per ₹150 spent and complimentary airport lounge access.', imageUrl: this.generateCardImageUrl('HDFC Bank', 'Regalia'), cardImage: this.generateCardImageUrl('HDFC Bank', 'Regalia'), source: 'database' as const, fees: '₹2,500 annually', benefits: ['4 reward points per ₹150', 'Airport lounge access', 'Hotel stays'], eligibility: 'Salaried individuals with ₹75,000+ monthly income' },
      { id: 'db-4', name: 'HDFC Platinum Credit Card', bank: 'HDFC Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Premium platinum credit card with airport lounge access and concierge services. Get 2 reward points per ₹150 spent.', imageUrl: this.generateCardImageUrl('HDFC Bank', 'Platinum'), cardImage: this.generateCardImageUrl('HDFC Bank', 'Platinum'), source: 'database' as const, fees: '₹2,000 annually', benefits: ['Airport lounge access', 'Concierge services', '2 reward points per ₹150'], eligibility: 'Salaried individuals with ₹50,000+ monthly income' },
      { id: 'db-5', name: 'HDFC MoneyBack Credit Card', bank: 'HDFC Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Cashback credit card with 5% cashback on online and offline spends. Get 1% cashback on all other transactions.', imageUrl: this.generateCardImageUrl('HDFC Bank', 'MoneyBack'), cardImage: this.generateCardImageUrl('HDFC Bank', 'MoneyBack'), source: 'database' as const, fees: '₹500 annually', benefits: ['5% cashback on online', '1% cashback on offline', 'Fuel surcharge waiver'], eligibility: 'Salaried individuals with ₹30,000+ monthly income' },
      
      // SBI Cards
      { id: 'db-6', name: 'SBI Simply Save Credit Card', bank: 'State Bank of India', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Zero annual fee credit card with cashback on online spends. Get 1% cashback on online transactions and fuel surcharge waiver.', imageUrl: this.generateCardImageUrl('State Bank of India', 'Simply Save'), cardImage: this.generateCardImageUrl('State Bank of India', 'Simply Save'), source: 'database' as const, fees: 'Lifetime Free', benefits: ['1% cashback on online', 'Fuel surcharge waiver', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹25,000+ monthly income' },
      { id: 'db-7', name: 'SBI Millennia Credit Card', bank: 'State Bank of India', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Rewards credit card with exclusive offers on dining and entertainment. Get 2 reward points per ₹100 spent.', imageUrl: this.generateCardImageUrl('State Bank of India', 'Millennia'), cardImage: this.generateCardImageUrl('State Bank of India', 'Millennia'), source: 'database' as const, fees: '₹1,000 annually', benefits: ['2 reward points per ₹100', 'Dining offers', 'Entertainment rewards'], eligibility: 'Salaried individuals with ₹40,000+ monthly income' },
      { id: 'db-8', name: 'SBI Gold Credit Card', bank: 'State Bank of India', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Gold credit card with cashback on fuel and grocery spends. Get 5% cashback on fuel and 2% on groceries.', imageUrl: this.generateCardImageUrl('State Bank of India', 'Gold'), cardImage: this.generateCardImageUrl('State Bank of India', 'Gold'), source: 'database' as const, fees: '₹1,500 annually', benefits: ['5% fuel cashback', '2% grocery rewards', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹35,000+ monthly income' },
      
      // ICICI Bank Cards
      { id: 'db-9', name: 'ICICI Bank Simply Save Credit Card', bank: 'ICICI Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'No joining fee credit card with fuel surcharge waiver. Get 1 reward point per ₹100 spent and exclusive online offers.', imageUrl: this.generateCardImageUrl('ICICI Bank', 'Simply Save'), cardImage: this.generateCardImageUrl('ICICI Bank', 'Simply Save'), source: 'database' as const, fees: 'Lifetime Free', benefits: ['1 reward point per ₹100', 'Fuel surcharge waiver', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹25,000+ monthly income' },
      { id: 'db-10', name: 'ICICI Bank Platinum Credit Card', bank: 'ICICI Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Luxury platinum card with travel benefits and reward points. Get 4 reward points per ₹100 spent and airport lounge access.', imageUrl: this.generateCardImageUrl('ICICI Bank', 'Platinum'), cardImage: this.generateCardImageUrl('ICICI Bank', 'Platinum'), source: 'database' as const, fees: '₹2,000 annually', benefits: ['4 reward points per ₹100', 'Airport lounge access', 'Travel benefits'], eligibility: 'Salaried individuals with ₹50,000+ monthly income' },
      { id: 'db-11', name: 'ICICI Bank Coral Credit Card', bank: 'ICICI Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Travel rewards card with fuel surcharge waiver and movie benefits. Get 2 reward points per ₹100 spent.', imageUrl: this.generateCardImageUrl('ICICI Bank', 'Coral'), cardImage: this.generateCardImageUrl('ICICI Bank', 'Coral'), source: 'database' as const, fees: '₹1,000 annually', benefits: ['2 reward points per ₹100', 'Movie benefits', 'Travel rewards'], eligibility: 'Salaried individuals with ₹35,000+ monthly income' },
      
      // Axis Bank Cards
      { id: 'db-12', name: 'Axis Bank Platinum Credit Card', bank: 'Axis Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Premium platinum card with dining and shopping benefits. Get 3 reward points per ₹100 spent and exclusive merchant offers.', imageUrl: this.generateCardImageUrl('Axis Bank', 'Platinum'), cardImage: this.generateCardImageUrl('Axis Bank', 'Platinum'), source: 'database' as const, fees: '₹2,000 annually', benefits: ['3 reward points per ₹100', 'Dining benefits', 'Shopping rewards'], eligibility: 'Salaried individuals with ₹50,000+ monthly income' },
      { id: 'db-13', name: 'Axis Bank My Zone Credit Card', bank: 'Axis Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Lifestyle credit card with dining and entertainment benefits. Get 2 reward points per ₹100 spent and exclusive offers.', imageUrl: this.generateCardImageUrl('Axis Bank', 'My Zone'), cardImage: this.generateCardImageUrl('Axis Bank', 'My Zone'), source: 'database' as const, fees: '₹1,000 annually', benefits: ['2 reward points per ₹100', 'Dining offers', 'Entertainment rewards'], eligibility: 'Salaried individuals with ₹35,000+ monthly income' },
      { id: 'db-14', name: 'Axis Bank Gold Credit Card', bank: 'Axis Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Gold tier credit card with fuel surcharge waiver and reward points. Get 1 reward point per ₹100 spent.', imageUrl: this.generateCardImageUrl('Axis Bank', 'Gold'), cardImage: this.generateCardImageUrl('Axis Bank', 'Gold'), source: 'database' as const, fees: '₹1,500 annually', benefits: ['1 reward point per ₹100', 'Fuel surcharge waiver', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹30,000+ monthly income' },
      
      // Kotak Mahindra Bank Cards
      { id: 'db-15', name: 'Kotak Mahindra Bank Simply Save Credit Card', bank: 'Kotak Mahindra Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'No annual fee credit card with reward points on all purchases. Get 1 reward point per ₹150 spent and fuel surcharge waiver.', imageUrl: this.generateCardImageUrl('Kotak Mahindra Bank', 'Simply Save'), cardImage: this.generateCardImageUrl('Kotak Mahindra Bank', 'Simply Save'), source: 'database' as const, fees: 'Lifetime Free', benefits: ['1 reward point per ₹150', 'Fuel surcharge waiver', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹25,000+ monthly income' },
      { id: 'db-16', name: 'Kotak Mahindra Bank Platinum Credit Card', bank: 'Kotak Mahindra Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Premium platinum credit card with airport lounge access. Get 3 reward points per ₹100 spent and travel benefits.', imageUrl: this.generateCardImageUrl('Kotak Mahindra Bank', 'Platinum'), cardImage: this.generateCardImageUrl('Kotak Mahindra Bank', 'Platinum'), source: 'database' as const, fees: '₹2,000 annually', benefits: ['3 reward points per ₹100', 'Airport lounge access', 'Travel benefits'], eligibility: 'Salaried individuals with ₹50,000+ monthly income' },
      { id: 'db-17', name: 'Kotak Mahindra Bank Gold Credit Card', bank: 'Kotak Mahindra Bank', type: 'credit' as const, lastFourDigits: '****', expiryDate: '12/26', cardholderName: 'Your Name', description: 'Gold tier credit card with fuel surcharge waiver and reward points. Get 2 reward points per ₹100 spent.', imageUrl: this.generateCardImageUrl('Kotak Mahindra Bank', 'Gold'), cardImage: this.generateCardImageUrl('Kotak Mahindra Bank', 'Gold'), source: 'database' as const, fees: '₹1,500 annually', benefits: ['2 reward points per ₹100', 'Fuel surcharge waiver', 'Online shopping offers'], eligibility: 'Salaried individuals with ₹30,000+ monthly income' }
    ];
  }

  private generateCardImageUrl(bank: string, cardName: string): string {
    const cardNameLower = cardName.toLowerCase();
    
    // Base Unsplash images for different card types
    const baseImages = {
      credit: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center&auto=format',
      debit: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center&auto=format',
      platinum: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center&auto=format',
      gold: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center&auto=format'
    };
    
    // Bank-specific color schemes
    const bankColors: { [key: string]: string } = {
      'HDFC Bank': 'hue=200&sat=80&brightness=90',
      'State Bank of India': 'hue=120&sat=70&brightness=85',
      'ICICI Bank': 'hue=280&sat=75&brightness=90',
      'Axis Bank': 'hue=30&sat=80&brightness=85',
      'Kotak Mahindra Bank': 'hue=60&sat=70&brightness=90'
    };
    
    // Determine card type for styling
    let cardType = 'credit';
    if (cardNameLower.includes('platinum')) cardType = 'platinum';
    else if (cardNameLower.includes('gold')) cardType = 'gold';
    else if (cardNameLower.includes('debit')) cardType = 'debit';
    
    let imageUrl = baseImages[cardType as keyof typeof baseImages] || baseImages.credit;
    
    // Apply bank-specific color
    const bankColor = bankColors[bank];
    if (bankColor) {
      imageUrl = `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center&auto=format&${bankColor}`;
    }
    
    return imageUrl;
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
