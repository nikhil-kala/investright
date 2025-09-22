import React, { useState, useEffect } from 'react';
import { UserSettings, SettingsFormData, settingsService } from '../shared/services/settingsService';
import { SETTINGS_CONFIG } from '../shared/constants';

interface SettingsProps {
  userId?: number;
}

const Settings: React.FC<SettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [formData, setFormData] = useState<SettingsFormData>({
    theme: 'auto',
    language: 'en',
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    profile_visibility: 'private',
    data_sharing: false,
    analytics: true,
    currency: 'USD',
    timezone: 'America/New_York',
    date_format: 'MM/DD/YYYY'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    setLoading(true);
    const response = await settingsService.getUserSettings(userId);
    if (response.success && response.settings) {
      setSettings(response.settings);
      setFormData(settingsService.settingsToFormData(response.settings));
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const response = await settingsService.updateUserSettings(userId, formData);
    if (response.success && response.settings) {
      setSettings(response.settings);
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings: ' + response.message);
    }
    
    setSaving(false);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const response = await settingsService.resetUserSettings(userId);
      if (response.success && response.settings) {
        setSettings(response.settings);
        setFormData(settingsService.settingsToFormData(response.settings));
        alert('Settings reset to default!');
      } else {
        alert('Failed to reset settings: ' + response.message);
      }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Appearance Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SETTINGS_CONFIG.supportedThemes.map(theme => (
                  <option key={theme.code} value={theme.code}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'es' | 'fr' | 'de' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SETTINGS_CONFIG.supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={formData.push_notifications}
                onChange={(e) => setFormData({ ...formData, push_notifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-sm text-gray-500">Receive updates via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={formData.sms_notifications}
                onChange={(e) => setFormData({ ...formData, sms_notifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={formData.profile_visibility}
                onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value as 'public' | 'private' | 'friends' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Data Sharing</label>
                <p className="text-sm text-gray-500">Allow data sharing for research</p>
              </div>
              <input
                type="checkbox"
                checked={formData.data_sharing}
                onChange={(e) => setFormData({ ...formData, data_sharing: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Analytics</label>
                <p className="text-sm text-gray-500">Help improve our service with analytics</p>
              </div>
              <input
                type="checkbox"
                checked={formData.analytics}
                onChange={(e) => setFormData({ ...formData, analytics: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'EUR' | 'GBP' | 'CAD' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SETTINGS_CONFIG.supportedCurrencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SETTINGS_CONFIG.timezones.map(timezone => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={formData.date_format}
                onChange={(e) => setFormData({ ...formData, date_format: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset to Default
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
