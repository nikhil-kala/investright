import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import InvestmentOptions from './components/InvestmentOptions';
import About from './components/About';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <Hero />
      <Features />
      <InvestmentOptions />
      <About />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;