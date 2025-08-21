import React from 'react';
import { TrendingUp, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="flex-1">
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
              {/* Tagline on same row */}
              <div className="ml-6 text-gray-300 max-w-md leading-relaxed">
                {t.footer.description}
              </div>
            </div>
            <div className="flex space-x-4 mb-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">wealth@investright.club</span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              {t.footer.copyright}
            </div>
          </div>

          <div className="md:ml-auto">
            <ul className="flex gap-8 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors whitespace-nowrap">{t.footer.contact}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}