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
  source?: string;
}

export default function CardManagerSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([]);
  const [addedCards, setAddedCards] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Debug logging
  console.log('CardManagerSimple: Component is rendering');

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    // Simulate search with mock data
    setTimeout(() => {
      const mockResults: CardSearchResult[] = [
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
          benefits: ['Reward points', 'Fuel surcharge waiver'],
          source: 'mock'
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
          benefits: ['4X reward points', 'Airport lounge access', 'Fuel surcharge waiver'],
          source: 'mock'
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
          benefits: ['Reward points', 'Fuel surcharge waiver'],
          source: 'mock'
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
        Credit Card Manager
      </h3>
      
      {/* Debug indicator */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
        ✅ Credit Card Manager is loaded and visible for all users
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for credit cards (e.g., HDFC, SBI, ICICI)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

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
          <h4 className="text-md font-semibold text-gray-900 mb-3">Search Results</h4>
          <div className="grid gap-3">
            {searchResults.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{card.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Bank: {card.bank}</span>
                      <span>Fees: {card.fees}</span>
                    </div>
                    {card.benefits && card.benefits.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Benefits: </span>
                        <span className="text-xs text-blue-600">{card.benefits.join(', ')}</span>
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
      {addedCards.length === 0 && searchResults.length === 0 && (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No credit cards added yet</p>
          <p className="text-sm text-gray-400">Search for credit cards to add them to your collection</p>
      </div>
      )}
    </div>
  );
}
