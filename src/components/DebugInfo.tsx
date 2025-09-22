import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const loadDebugInfo = () => {
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();
      const sessionToken = authService.getSessionToken();
      
      // Check localStorage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('sessionToken');
      
      // Check demo users
      const demoAdmin = localStorage.getItem('user_demo@investright.com');
      const demoUser = localStorage.getItem('user_user@investright.com');
      
      setDebugInfo({
        currentUser,
        isAuthenticated,
        sessionToken: sessionToken ? sessionToken.substring(0, 20) + '...' : null,
        storedUser: storedUser ? 'Yes' : 'No',
        storedToken: storedToken ? 'Yes' : 'No',
        demoAdmin: demoAdmin ? 'Yes' : 'No',
        demoUser: demoUser ? 'Yes' : 'No',
        currentUrl: window.location.href,
        localStorage: Object.keys(localStorage).filter(key => 
          key.includes('user') || key.includes('session') || key.includes('chat')
        )
      });
    };

    loadDebugInfo();
    const interval = setInterval(loadDebugInfo, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-300 p-4 rounded-lg max-w-md text-xs z-50">
      <h3 className="font-bold text-red-800 mb-2">🐛 Debug Info</h3>
      <div className="space-y-1 text-red-700">
        <p><strong>URL:</strong> {debugInfo.currentUrl}</p>
        <p><strong>Authenticated:</strong> {debugInfo.isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Current User:</strong> {debugInfo.currentUser?.email || 'None'}</p>
        <p><strong>User Role:</strong> {debugInfo.currentUser?.role || 'None'}</p>
        <p><strong>Session Token:</strong> {debugInfo.sessionToken || 'None'}</p>
        <p><strong>Stored User:</strong> {debugInfo.storedUser}</p>
        <p><strong>Stored Token:</strong> {debugInfo.storedToken}</p>
        <p><strong>Demo Admin:</strong> {debugInfo.demoAdmin}</p>
        <p><strong>Demo User:</strong> {debugInfo.demoUser}</p>
        <p><strong>LocalStorage Keys:</strong> {debugInfo.localStorage?.join(', ') || 'None'}</p>
      </div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={() => {
            console.log('Full debug info:', debugInfo);
            console.log('Auth service:', authService);
            console.log('LocalStorage contents:', localStorage);
          }}
          className="px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-xs"
        >
          Log to Console
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-xs"
        >
          Clear & Reload
        </button>
      </div>
    </div>
  );
}
