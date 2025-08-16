import React from 'react';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useLanguage } from '../hooks/useLanguage';

export default function Hero() {
  const { t } = useLanguage();

  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
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