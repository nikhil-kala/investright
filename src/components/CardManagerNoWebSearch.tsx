import React, { useState, useEffect } from 'react';
import { Search, Plus, CreditCard, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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
}

// Simple mock database for testing
const MOCK_CARDS: CardSearchResult[] = [
  {
    id: '1',
    name: 'HDFC Simply Save Credit Card',
    type: 'credit',
    bank: 'HDFC Bank',
    lastFourDigits: '1234',
    expiryDate: '12/26',
    cardholderName: 'Your Name',
    description: 'No annual fee credit card with reward points on all purchases',
    fees: 'Lifetime Free',
    benefits: ['Reward points', 'Fuel surcharge waiver']
  },
  {
    id: '2',
    name: 'SBI Platinum Credit Card',
    type: 'credit',
    bank: 'State Bank of India',
    lastFourDigits: '5678',
    expiryDate: '08/25',
    cardholderName: 'Your Name',
    description: 'Premium credit card with high reward rates and exclusive benefits',
    fees: '₹2,000 annually',
    benefits: ['4X reward points', 'Airport lounge access', 'Fuel surcharge waiver']
  },
  {
    id: '3',
    name: 'ICICI Bank Coral Credit Card',
    type: 'credit',
    bank: 'ICICI Bank',
    lastFourDigits: '9012',
    expiryDate: '06/27',
    cardholderName: 'Your Name',
    description: 'Coral credit card with reward points and fuel surcharge waiver',
    fees: '₹500 annually',
    benefits: ['Reward points', 'Fuel surcharge waiver']
  }
];

export default function CardManagerNoWebSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardSearchResult | null>(null);
  const [addedCards, setAddedCards] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [duplicateCardId, setDuplicateCardId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load saved cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem('userCards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        // Convert addedDate strings back to Date objects
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple search in mock database
      const results = MOCK_CARDS.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for credit cards:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardSelect = (card: CardSearchResult) => {
    setSelectedCard(card);
  };

  const handleAddCard = () => {
    if (!selectedCard) return;

    // Check for duplicates
    const isDuplicate = addedCards.some(card => card.id === selectedCard.id);
    
    if (isDuplicate) {
      // Highlight the duplicate card
      setDuplicateCardId(selectedCard.id);
      setTimeout(() => setDuplicateCardId(null), 3000); // Remove highlight after 3 seconds
      return;
    }

    // Add the card to the list
    const newCard: Card = {
      id: selectedCard.id,
      name: selectedCard.name,
      type: selectedCard.type,
      bank: selectedCard.bank,
      lastFourDigits: selectedCard.lastFourDigits,
      expiryDate: selectedCard.expiryDate,
      cardholderName: selectedCard.cardholderName,
      addedDate: new Date()
    };

    setAddedCards(prev => [...prev, newCard]);
    setSelectedCard(null);
    setSearchTerm('');
    setSearchResults([]);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleRemoveCard = (cardId: string) => {
    setAddedCards(prev => prev.filter(card => card.id !== cardId));
  };

  const getCardTypeColor = (type: string) => {
    return type === 'credit' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const formatCardNumber = (lastFour: string) => {
    return `**** **** **** ${lastFour}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Card Manager (No Web Search)</h1>
        <p className="text-gray-600">Testing with mock data - no web search service</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Credit Cards</h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for credit cards (e.g., 'simply save', 'platinum', 'coral')"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search
              </>
            )}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.length} cards found)
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCard?.id === card.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${duplicateCardId === card.id ? 'border-red-500 bg-red-50' : ''}`}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{card.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCardTypeColor(card.type)}`}>
                      {card.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{card.bank}</p>
                  {card.description && (
                    <p className="text-sm text-gray-500 mb-3">{card.description}</p>
                  )}
                  {card.fees && (
                    <p className="text-sm text-green-600 font-medium">Fees: {card.fees}</p>
                  )}
                  {card.benefits && card.benefits.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Benefits:</p>
                      <div className="flex flex-wrap gap-1">
                        {card.benefits.slice(0, 2).map((benefit, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {benefit}
                          </span>
                        ))}
                        {card.benefits.length > 2 && (
                          <span className="text-xs text-gray-500">+{card.benefits.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedCard && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddCard}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Selected Card
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && !isSearching && searchTerm && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No credit cards found for "{searchTerm}"</p>
            <p className="text-sm text-gray-400 mt-1">Try searching with different terms</p>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
          <CheckCircle className="h-5 w-5 mr-2" />
          Card added successfully!
        </div>
      )}

      {/* My Cards Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Credit Cards ({addedCards.length})</h2>
        
        {addedCards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No credit cards added yet</p>
            <p className="text-sm text-gray-400 mt-1">Search and add your first credit card above</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addedCards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{card.name}</h3>
                    <p className="text-sm text-gray-600">{card.bank}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Card Number:</span>
                    <span className="font-mono">{formatCardNumber(card.lastFourDigits)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expiry:</span>
                    <span>{card.expiryDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cardholder:</span>
                    <span>{card.cardholderName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Added:</span>
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
        )}
      </div>
    </div>
  );
}
