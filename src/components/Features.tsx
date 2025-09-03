import React from 'react';
import { MessageCircle, Target, Scale, UserCheck, Trophy, TrendingUp } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageCircle,
      title: t.features.calculator.title,
      description: t.features.calculator.description
    },
    {
      icon: Target,
      title: t.features.portfolio.title,
      description: t.features.portfolio.description
    },
    {
      icon: Scale,
      title: t.features.education.title,
      description: t.features.education.description
    },
    {
      icon: UserCheck,
      title: t.features.research.title,
      description: t.features.research.description
    },
    {
      icon: Trophy,
      title: t.features.risk.title,
      description: t.features.risk.description
    },
    {
      icon: TrendingUp,
      title: t.features.execution.title,
      description: t.features.execution.description
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.features.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-8 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${
                index === 0 ? 'bg-blue-100' : // Chat-based AI Advisor - Blue
                index === 1 ? 'bg-green-100' : // Holistic Life Goal Planning - Green
                index === 2 ? 'bg-purple-100' : // Unbiased Financial Advice - Purple
                index === 3 ? 'bg-indigo-100' : // Personalized Strategies - Indigo
                index === 4 ? 'bg-yellow-100' : // Dream Goal Tracker - Yellow
                'bg-orange-100' // Smart Income Growth Tips - Orange
              }`}>
                <feature.icon className={`h-6 w-6 ${
                  index === 0 ? 'text-blue-700' : // Chat-based AI Advisor
                  index === 1 ? 'text-green-700' : // Holistic Life Goal Planning
                  index === 2 ? 'text-purple-700' : // Unbiased Financial Advice
                  index === 3 ? 'text-indigo-700' : // Personalized Strategies
                  index === 4 ? 'text-yellow-700' : // Dream Goal Tracker
                  'text-orange-700' // Smart Income Growth Tips
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}