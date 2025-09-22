import { CreditCard, CreditCardFormData, CreditCardResponse, CreditCardListResponse } from '../types';
import { CREDIT_CARD_CONFIG } from '../constants';
import { getStorageAdapter } from './webStorageAdapter';

class CreditCardService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Get all credit cards for a user
  async getUserCreditCards(userId: number): Promise<CreditCardListResponse> {
    try {
      // In a real app, this would make an API call
      // For now, we'll simulate with storage
      const storage = getStorageAdapter();
      const storageKey = `credit_cards_${userId}`;
      const storedCards = await storage.getItem(storageKey);
      
      if (storedCards) {
        const cards = JSON.parse(storedCards);
        return {
          success: true,
          cards: cards,
          message: 'Credit cards retrieved successfully'
        };
      }

      return {
        success: true,
        cards: [],
        message: 'No credit cards found'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve credit cards',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Add a new credit card
  async addCreditCard(userId: number, cardData: CreditCardFormData): Promise<CreditCardResponse> {
    try {
      // Validate card data
      const validation = this.validateCardData(cardData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || 'Invalid card data'
        };
      }

      // Check if user has reached max cards
      const existingCards = await this.getUserCreditCards(userId);
      if (existingCards.cards && existingCards.cards.length >= CREDIT_CARD_CONFIG.maxCards) {
        return {
          success: false,
          message: `Maximum ${CREDIT_CARD_CONFIG.maxCards} cards allowed`
        };
      }

      // Create new card
      const newCard: CreditCard = {
        id: Date.now(),
        user_id: userId,
        card_number: this.maskCardNumber(cardData.card_number),
        card_holder_name: cardData.card_holder_name,
        expiry_month: cardData.expiry_month,
        expiry_year: cardData.expiry_year,
        cvv: '***', // Never store actual CVV
        card_type: this.detectCardType(cardData.card_number),
        is_primary: cardData.is_primary || false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to storage
      const storage = getStorageAdapter();
      const storageKey = `credit_cards_${userId}`;
      const existingCardsData = existingCards.cards || [];
      const updatedCards = [...existingCardsData, newCard];
      await storage.setItem(storageKey, JSON.stringify(updatedCards));

      return {
        success: true,
        card: newCard,
        message: 'Credit card added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add credit card',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update a credit card
  async updateCreditCard(userId: number, cardId: number, cardData: Partial<CreditCardFormData>): Promise<CreditCardResponse> {
    try {
      const existingCards = await this.getUserCreditCards(userId);
      if (!existingCards.success || !existingCards.cards) {
        return {
          success: false,
          message: 'Failed to retrieve existing cards'
        };
      }

      const cardIndex = existingCards.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
        return {
          success: false,
          message: 'Credit card not found'
        };
      }

      // Update card data
      const updatedCard = {
        ...existingCards.cards[cardIndex],
        ...cardData,
        updated_at: new Date().toISOString()
      };

      // Validate if updating card number
      if (cardData.card_number) {
        const validation = this.validateCardData(cardData as CreditCardFormData);
        if (!validation.isValid) {
          return {
            success: false,
            message: validation.error || 'Invalid card data'
          };
        }
        updatedCard.card_number = this.maskCardNumber(cardData.card_number);
        updatedCard.card_type = this.detectCardType(cardData.card_number);
      }

      // Update in storage
      const storage = getStorageAdapter();
      const updatedCards = [...existingCards.cards];
      updatedCards[cardIndex] = updatedCard;
      const storageKey = `credit_cards_${userId}`;
      await storage.setItem(storageKey, JSON.stringify(updatedCards));

      return {
        success: true,
        card: updatedCard,
        message: 'Credit card updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update credit card',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete a credit card
  async deleteCreditCard(userId: number, cardId: number): Promise<CreditCardResponse> {
    try {
      const existingCards = await this.getUserCreditCards(userId);
      if (!existingCards.success || !existingCards.cards) {
        return {
          success: false,
          message: 'Failed to retrieve existing cards'
        };
      }

      const storage = getStorageAdapter();
      const updatedCards = existingCards.cards.filter(card => card.id !== cardId);
      const storageKey = `credit_cards_${userId}`;
      await storage.setItem(storageKey, JSON.stringify(updatedCards));

      return {
        success: true,
        message: 'Credit card deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete credit card',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Set primary card
  async setPrimaryCard(userId: number, cardId: number): Promise<CreditCardResponse> {
    try {
      const existingCards = await this.getUserCreditCards(userId);
      if (!existingCards.success || !existingCards.cards) {
        return {
          success: false,
          message: 'Failed to retrieve existing cards'
        };
      }

      // Remove primary status from all cards
      const updatedCards = existingCards.cards.map(card => ({
        ...card,
        is_primary: card.id === cardId,
        updated_at: card.id === cardId ? new Date().toISOString() : card.updated_at
      }));

      const storage = getStorageAdapter();
      const storageKey = `credit_cards_${userId}`;
      await storage.setItem(storageKey, JSON.stringify(updatedCards));

      const primaryCard = updatedCards.find(card => card.id === cardId);
      return {
        success: true,
        card: primaryCard,
        message: 'Primary card updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to set primary card',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Validate card data
  private validateCardData(cardData: CreditCardFormData): { isValid: boolean; error?: string } {
    if (!cardData.card_number || cardData.card_number.length !== CREDIT_CARD_CONFIG.cardNumberLength) {
      return { isValid: false, error: 'Invalid card number' };
    }

    if (!cardData.card_holder_name || cardData.card_holder_name.trim().length < 2) {
      return { isValid: false, error: 'Invalid card holder name' };
    }

    if (!cardData.expiry_month || cardData.expiry_month < 1 || cardData.expiry_month > 12) {
      return { isValid: false, error: 'Invalid expiry month' };
    }

    const currentYear = new Date().getFullYear();
    if (!cardData.expiry_year || cardData.expiry_year < currentYear) {
      return { isValid: false, error: 'Invalid expiry year' };
    }

    if (!cardData.cvv || cardData.cvv.length !== CREDIT_CARD_CONFIG.cvvLength) {
      return { isValid: false, error: 'Invalid CVV' };
    }

    return { isValid: true };
  }

  // Detect card type from number
  private detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' {
    if (cardNumber.startsWith('4')) return 'visa';
    if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) return 'mastercard';
    if (cardNumber.startsWith('3')) return 'amex';
    return 'discover';
  }

  // Mask card number for display
  private maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1 **** **** $3');
  }
}

// Create and export singleton instance
export const creditCardService = new CreditCardService();
