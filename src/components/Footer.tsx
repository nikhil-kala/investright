import React from 'react';
import { TrendingUp, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              {/* InvestRight Logo */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <div className="relative">
                    {/* Upward trending line */}
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M3 18L9 12L15 16L21 6" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    {/* Green circle at peak */}
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    {/* Green arrow above */}
                    <div className="absolute -top-3 -right-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-green-500"></div>
                  </div>
                </div>
              </div>
              {/* Company Name */}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-400">Invest</span>
                <span className="text-xl font-bold text-green-400 -mt-1">Right</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">wealth@investright.club</span>
              </div>
            </div>
          </div>

          <div>
            <ul className="flex gap-8 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors whitespace-nowrap">{t.footer.helpCenter}</a></li>
              <li><a href="#" className="hover:text-white transition-colors whitespace-nowrap">{t.footer.contact}</a></li>
              <li><a href="#" className="hover:text-white transition-colors whitespace-nowrap">{t.footer.privacy}</a></li>
              <li><a href="#" className="hover:text-white transition-colors whitespace-nowrap">{t.footer.terms}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}