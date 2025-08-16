import React from 'react';
import { Building, Coins, TrendingUp, Landmark } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function InvestmentOptions() {
  const { t } = useLanguage();

  const options = [
    {
      icon: Building,
      title: t.investmentOptions.stocks.title,
      description: t.investmentOptions.stocks.description,
      minInvestment: t.investmentOptions.stocks.minInvestment,
      riskLevel: t.investmentOptions.stocks.riskLevel,
      color: 'bg-blue-500'
    },
    {
      icon: Landmark,
      title: t.investmentOptions.bonds.title,
      description: t.investmentOptions.bonds.description,
      minInvestment: t.investmentOptions.bonds.minInvestment,
      riskLevel: t.investmentOptions.bonds.riskLevel,
      color: 'bg-emerald-500'
    },
    {
      icon: TrendingUp,
      title: t.investmentOptions.mutualFunds.title,
      description: t.investmentOptions.mutualFunds.description,
      minInvestment: t.investmentOptions.mutualFunds.minInvestment,
      riskLevel: t.investmentOptions.mutualFunds.riskLevel,
      color: 'bg-amber-500'
    },
    {
      icon: Coins,
      title: t.investmentOptions.indexFunds.title,
      description: t.investmentOptions.indexFunds.description,
      minInvestment: t.investmentOptions.indexFunds.minInvestment,
      riskLevel: t.investmentOptions.indexFunds.riskLevel,
      color: 'bg-purple-500'
    }
  ];

  return (
    <section id="options" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.investmentOptions.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.investmentOptions.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {options.map((option, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`${option.color} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                <option.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{option.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{option.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.investmentOptions.minInvestmentLabel}</span>
                  <span className="font-semibold text-gray-900">{option.minInvestment}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.investmentOptions.riskLevelLabel}</span>
                  <span className="font-semibold text-gray-900">{option.riskLevel}</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-200 font-medium">
                {t.investmentOptions.learnMore}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}