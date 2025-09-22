import React, { useState, useEffect } from 'react';
import { CreditCard, CreditCardFormData, creditCardService } from '../shared/services/creditCardService';
import { CREDIT_CARD_CONFIG } from '../shared/constants';

interface CreditCardsProps {
  userId?: number;
}

const CreditCards: React.FC<CreditCardsProps> = ({ userId }) => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreditCardFormData>({
    card_number: '',
    card_holder_name: '',
    expiry_month: 1,
    expiry_year: new Date().getFullYear(),
    cvv: '',
    is_primary: false
  });

  useEffect(() => {
    loadCreditCards();
  }, [userId]);

  const loadCreditCards = async () => {
    setLoading(true);
    const response = await creditCardService.getUserCreditCards(userId);
    if (response.success && response.cards) {
      setCards(response.cards);
    }
    setLoading(false);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await creditCardService.addCreditCard(userId, formData);
    if (response.success) {
      await loadCreditCards();
      setShowAddForm(false);
      setFormData({
        card_number: '',
        card_holder_name: '',
        expiry_month: 1,
        expiry_year: new Date().getFullYear(),
        cvv: '',
        is_primary: false
      });
    } else {
      alert(response.message);
    }
  };

  const handleSetPrimary = async (cardId: number) => {
    const response = await creditCardService.setPrimaryCard(userId, cardId);
    if (response.success) {
      await loadCreditCards();
    } else {
      alert(response.message);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      const response = await creditCardService.deleteCreditCard(userId, cardId);
      if (response.success) {
        await loadCreditCards();
      } else {
        alert(response.message);
      }
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Credit Cards</h2>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={cards.length >= CREDIT_CARD_CONFIG.maxCards}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Credit Cards</h3>
          <p className="text-gray-500">Add your first credit card to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                card.is_primary ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getCardTypeIcon(card.card_type)}</span>
                  <span className="text-sm font-medium text-gray-600 uppercase">
                    {card.card_type}
                  </span>
                </div>
                {card.is_primary && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Primary
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="text-lg font-mono text-gray-900 mb-2">
                  {card.card_number}
                </div>
                <div className="text-sm text-gray-600">
                  {card.card_holder_name}
                </div>
                <div className="text-sm text-gray-600">
                  {card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year}
                </div>
              </div>

              <div className="flex space-x-2">
                {!card.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(card.id)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Credit Card</h3>
            <form onSubmit={handleAddCard}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.card_number}
                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.card_holder_name}
                    onChange={(e) => setFormData({ ...formData, card_holder_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Month
                    </label>
                    <select
                      value={formData.expiry_month}
                      onChange={(e) => setFormData({ ...formData, expiry_month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {(i + 1).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Year
                    </label>
                    <select
                      value={formData.expiry_year}
                      onChange={(e) => setFormData({ ...formData, expiry_year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                    Set as primary card
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;
