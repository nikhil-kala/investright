import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          InvestRight App Test
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          If you can see this, React is working!
        </p>
        <div className="text-sm text-gray-500">
          Current time: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
