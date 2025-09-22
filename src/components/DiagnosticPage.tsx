import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function DiagnosticPage() {
  const [status, setStatus] = useState('Loading...');
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog('🔍 Starting diagnostics...');
      
      // Check if demo users exist
      const demoAdminExists = authService.checkUserExists('demo@investright.com');
      const demoUserExists = authService.checkUserExists('user@investright.com');
      
      addLog(`Demo admin exists: ${demoAdminExists}`);
      addLog(`Demo user exists: ${demoUserExists}`);
      
      if (!demoAdminExists || !demoUserExists) {
        addLog('Creating demo users...');
        authService.createDemoUsers();
        addLog('Demo users created');
      }
      
      // Check authentication status
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();
      
      addLog(`Current user: ${currentUser?.email || 'None'}`);
      addLog(`Is authenticated: ${isAuthenticated}`);
      
      // Check localStorage
      const localStorageKeys = Object.keys(localStorage);
      addLog(`LocalStorage keys: ${localStorageKeys.join(', ')}`);
      
      setStatus('Diagnostics complete');
    };

    runDiagnostics();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    addLog(`Attempting login for ${email}...`);
    const result = await authService.login({ email, password });
    addLog(`Login result: ${result.success ? 'Success' : `Failed - ${result.message}`}`);
    
    if (result.success) {
      addLog('Redirecting to dashboard...');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Application Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status: {status}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Quick Login (Demo Accounts)</h3>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => handleLogin('demo@investright.com', 'demo123')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Login as Admin
                </button>
                <button 
                  onClick={() => handleLogin('user@investright.com', 'user123')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Login as User
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Navigation</h3>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Go to Home
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Go to Login
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Actions</h3>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Storage & Reload
                </button>
                <button 
                  onClick={() => {
                    authService.createDemoUsers();
                    addLog('Demo users recreated');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Recreate Demo Users
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Diagnostic Logs</h2>
          <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
