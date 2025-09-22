// Storage adapter for cross-platform compatibility
export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// Web storage adapter
export const webStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

// Mobile storage adapter (using AsyncStorage) - only available in React Native
export const mobileStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      // Only try to import AsyncStorage if we're actually in React Native
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.getItem(key);
      }
      // Fallback to web storage
      return webStorageAdapter.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return webStorageAdapter.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Only try to import AsyncStorage if we're actually in React Native
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(key, value);
      } else {
        // Fallback to web storage
        await webStorageAdapter.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
      await webStorageAdapter.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    try {
      // Only try to import AsyncStorage if we're actually in React Native
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem(key);
      } else {
        // Fallback to web storage
        await webStorageAdapter.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
      await webStorageAdapter.removeItem(key);
    }
  },
};

// Auto-detect platform and return appropriate adapter
export const getStorageAdapter = (): StorageAdapter => {
  // Check if we're in React Native environment
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return mobileStorageAdapter;
  }
  
  // For web environments, always use web storage
  return webStorageAdapter;
};

