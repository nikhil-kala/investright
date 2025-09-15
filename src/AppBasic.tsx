import React from 'react';

function App() {
  console.log('App component is rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          🎉 InvestRight App is Working!
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          React is rendering successfully
        </p>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#9ca3af'
        }}>
          Current time: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default App;
