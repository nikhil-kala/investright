export interface UserSettings {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    data_sharing: boolean;
    analytics: boolean;
  };
  preferences: {
    currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
    timezone: string;
    date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
  created_at: string;
  updated_at: string;
}

export interface SettingsFormData {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  profile_visibility: 'public' | 'private' | 'friends';
  data_sharing: boolean;
  analytics: boolean;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

export interface SettingsResponse {
  success: boolean;
  settings?: UserSettings;
  message: string;
  error?: string;
}
