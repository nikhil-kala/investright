import React from 'react';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* InvestRight Logo */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                <div className="relative">
                  {/* Upward trending line */}
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M3 18L9 12L15 16L21 6" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* Green circle at peak */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                  {/* Green arrow above */}
                  <div className="absolute -top-5 -right-1 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-green-500"></div>
                </div>
              </div>
            </div>
            {/* Company Name */}
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-blue-700">Invest</span>
              <span className="text-4xl font-bold text-green-600 -mt-2">Right</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t.hero.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-800 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
              {t.hero.startInvesting}
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-blue-700 text-blue-700 px-8 py-4 rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-200 font-semibold text-lg">
              {t.hero.learnMore}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.hero.secureRegulated}</h3>
              <p className="text-gray-600 text-sm">{t.hero.secureDesc}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.hero.expertGuidance}</h3>
              <p className="text-gray-600 text-sm">{t.hero.expertDesc}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.hero.lowFees}</h3>
              <p className="text-gray-600 text-sm">{t.hero.lowFeesDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}