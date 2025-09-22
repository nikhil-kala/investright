export interface CreditCard {
  id: number;
  user_id: number;
  card_number: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  card_type: 'visa' | 'mastercard' | 'amex' | 'discover';
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCardFormData {
  card_number: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  is_primary?: boolean;
}

export interface CreditCardResponse {
  success: boolean;
  card?: CreditCard;
  message: string;
  error?: string;
}

export interface CreditCardListResponse {
  success: boolean;
  cards?: CreditCard[];
  message: string;
  error?: string;
}
