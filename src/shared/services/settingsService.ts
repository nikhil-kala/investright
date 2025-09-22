import { UserSettings, SettingsFormData, SettingsResponse } from '../types';
import { SETTINGS_CONFIG } from '../constants';
import { getStorageAdapter } from './webStorageAdapter';

class SettingsService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Get user settings
  async getUserSettings(userId: number): Promise<SettingsResponse> {
    try {
      const storage = getStorageAdapter();
      const storageKey = `user_settings_${userId}`;
      const storedSettings = await storage.getItem(storageKey);
      
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        return {
          success: true,
          settings: settings,
          message: 'Settings retrieved successfully'
        };
      }

      // Return default settings if none exist
      const defaultSettings = this.getDefaultSettings(userId);
      return {
        success: true,
        settings: defaultSettings,
        message: 'Default settings loaded'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user settings
  async updateUserSettings(userId: number, formData: SettingsFormData): Promise<SettingsResponse> {
    try {
      const settings: UserSettings = {
        id: Date.now(),
        user_id: userId,
        theme: formData.theme,
        language: formData.language,
        notifications: {
          email: formData.email_notifications,
          push: formData.push_notifications,
          sms: formData.sms_notifications,
        },
        privacy: {
          profile_visibility: formData.profile_visibility,
          data_sharing: formData.data_sharing,
          analytics: formData.analytics,
        },
        preferences: {
          currency: formData.currency,
          timezone: formData.timezone,
          date_format: formData.date_format,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to storage
      const storage = getStorageAdapter();
      const storageKey = `user_settings_${userId}`;
      await storage.setItem(storageKey, JSON.stringify(settings));

      return {
        success: true,
        settings: settings,
        message: 'Settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Reset settings to default
  async resetUserSettings(userId: number): Promise<SettingsResponse> {
    try {
      const storage = getStorageAdapter();
      const defaultSettings = this.getDefaultSettings(userId);
      const storageKey = `user_settings_${userId}`;
      await storage.setItem(storageKey, JSON.stringify(defaultSettings));

      return {
        success: true,
        settings: defaultSettings,
        message: 'Settings reset to default'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reset settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get default settings
  private getDefaultSettings(userId: number): UserSettings {
    return {
      id: Date.now(),
      user_id: userId,
      theme: 'auto',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profile_visibility: 'private',
        data_sharing: false,
        analytics: true,
      },
      preferences: {
        currency: 'USD',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Convert settings to form data
  settingsToFormData(settings: UserSettings): SettingsFormData {
    return {
      theme: settings.theme,
      language: settings.language,
      email_notifications: settings.notifications.email,
      push_notifications: settings.notifications.push,
      sms_notifications: settings.notifications.sms,
      profile_visibility: settings.privacy.profile_visibility,
      data_sharing: settings.privacy.data_sharing,
      analytics: settings.privacy.analytics,
      currency: settings.preferences.currency,
      timezone: settings.preferences.timezone,
      date_format: settings.preferences.date_format,
    };
  }

  // Get available languages
  getAvailableLanguages() {
    return SETTINGS_CONFIG.supportedLanguages;
  }

  // Get available currencies
  getAvailableCurrencies() {
    return SETTINGS_CONFIG.supportedCurrencies;
  }

  // Get available themes
  getAvailableThemes() {
    return SETTINGS_CONFIG.supportedThemes;
  }

  // Get available timezones
  getAvailableTimezones() {
    return SETTINGS_CONFIG.timezones;
  }
}

// Create and export singleton instance
export const settingsService = new SettingsService();
