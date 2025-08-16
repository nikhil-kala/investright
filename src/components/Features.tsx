import React from 'react';
import { Calculator, PieChart, BookOpen, BarChart3, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useLanguage } from '../hooks/useLanguage';

export default function Features() {
  const { t } = useLanguage();

  const { t } = useLanguage();

  const features = [
    {
      icon: Calculator,
      title: t.features.calculator.title,
      description: t.features.calculator.description
    },
    {
      icon: PieChart,
      title: t.features.portfolio.title,
      description: t.features.portfolio.description
    },
    {
      icon: BookOpen,
      title: t.features.education.title,
      description: t.features.education.description
    },
    {
      icon: BarChart3,
      title: t.features.research.title,
      description: t.features.research.description
    },
    {
      icon: Shield,
      title: t.features.risk.title,
      description: t.features.risk.description
    },
    {
      icon: Zap,
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
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-blue-700" />
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