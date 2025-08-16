import React from 'react';
import { Users, Award, Target, Heart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t.about.title}
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t.about.description}
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">50K+</div>
                <div className="text-sm text-gray-600">{t.about.activeInvestors}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">₹15,000 करोड़+</div>
                <div className="text-sm text-gray-600">{t.about.assetsUnderManagement}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">0.25%</div>
                <div className="text-sm text-gray-600">{t.about.averageFee}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">4.8★</div>
                <div className="text-sm text-gray-600">{t.about.userRating}</div>
              </div>
            </div>

            <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
              {t.about.startJourney}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <Users className="h-8 w-8 text-blue-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.communityFocused.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.communityFocused.description}</p>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-xl">
              <Award className="h-8 w-8 text-emerald-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.awardWinning.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.awardWinning.description}</p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-xl">
              <Target className="h-8 w-8 text-amber-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.goalOriented.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.goalOriented.description}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl">
              <Heart className="h-8 w-8 text-purple-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.about.transparent.title}</h3>
              <p className="text-gray-600 text-sm">{t.about.transparent.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}