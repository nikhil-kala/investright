import React from 'react';
import { TrendingUp, Menu, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-700 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{t.header.brand}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
              {t.header.features}
            </a>
            <a href="#options" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
              {t.header.investmentOptions}
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
              {t.header.about}
            </a>
            <LanguageSelector />
            <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium">
              {t.header.getStarted}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
                {t.header.features}
              </a>
              <a href="#options" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
                {t.header.investmentOptions}
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
                {t.header.about}
              </a>
              <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium w-full">
                {t.header.getStarted}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}