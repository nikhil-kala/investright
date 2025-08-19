import React, { useState } from 'react';
import { testSupabaseConnection, supabase, isSupabaseConfigured } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      console.log('🔍 Testing Supabase connection...');
      console.log('Environment variables:', {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      });
      
      // Test basic client creation
      console.log('🔧 Supabase client status:', {
        isConfigured: isSupabaseConfigured(),
        clientExists: !!supabase,
        clientType: supabase ? typeof supabase : 'null'
      });
      
      const result = await testSupabaseConnection();
      console.log('📊 Test result:', result);
      setTestResult(result);
    } catch (error) {
      console.error('💥 Test error:', error);
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Supabase Connection Test</h3>
      
      {/* Environment Variables Status */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
        <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
      </div>
      
      <button
        onClick={handleTestConnection}
        disabled={isTesting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </button>

      {/* Simple Environment Test */}
      <button
        onClick={() => {
          console.log('🔍 Environment Variables Check:');
          console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
          console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Not set');
          console.log('Supabase client:', supabase);
          alert('Check browser console for environment variable details');
        }}
        className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mb-3"
      >
        Check Environment Variables
      </button>

      {testResult && (
        <div className={`p-3 rounded-lg text-sm ${
          testResult.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <strong>{testResult.success ? '✅ Success:' : '❌ Error:'}</strong>
          <p className="mt-1">{testResult.message}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
};

export default SupabaseTest;
