export const APP_CONFIG = {
  name: 'InvestRight',
  version: '1.0.0',
  description: 'AI-Powered Investment Advisory Platform',
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },
  chat: {
    messages: '/chat/messages',
    conversations: '/chat/conversations',
    send: '/chat/send',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const;

export const CHAT_CONFIG = {
  maxMessageLength: 1000,
  maxConversations: 10,
  messageDelay: 1000, // ms
} as const;

export const CREDIT_CARD_CONFIG = {
  maxCards: 5,
  cardNumberLength: 16,
  cvvLength: 3,
  expiryYears: 10, // years from current year
  supportedTypes: ['visa', 'mastercard', 'amex', 'discover'] as const,
} as const;

export const SETTINGS_CONFIG = {
  supportedLanguages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ],
  supportedCurrencies: [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  ],
  supportedThemes: [
    { code: 'light', name: 'Light' },
    { code: 'dark', name: 'Dark' },
    { code: 'auto', name: 'Auto' },
  ],
  timezones: [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ],
} as const;
