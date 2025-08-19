import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';
import { TrendingUp, Users, Award, Target, Eye, Heart, Lightbulb, Globe } from 'lucide-react';

const OurStory: React.FC = () => {
  const { currentLanguage, t } = useLanguage();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t.ourStory?.title || 'Our Story'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.ourStory?.subtitle || 'From humble beginnings to empowering millions of small investors worldwide. Discover the journey that shaped Invest Right into the trusted platform it is today.'}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t.ourStory?.missionTitle || 'Our Mission'}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t.ourStory?.missionText || 'We believe that smart investing shouldn\'t be limited to the wealthy. Our mission is to democratize professional-grade investment tools and make them accessible to everyone, regardless of their portfolio size.'}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.ourStory?.missionText2 || 'By combining cutting-edge technology with financial expertise, we\'re building a future where every individual can make informed investment decisions and build lasting wealth.'}
              </p>
            </div>
            <div className="relative">
              <div className="bg-blue-100 rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-blue-700 p-4 rounded-full">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  {t.ourStory?.missionCardTitle || 'Empowering Small Investors'}
                </h3>
                <p className="text-gray-600 text-center">
                  {t.ourStory?.missionCardText || 'Making professional investment tools accessible to everyone'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t.ourStory?.journeyTitle || 'Our Journey'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.ourStory?.journeySubtitle || 'Key milestones that shaped our path to becoming a trusted investment platform'}
            </p>
          </div>

          <div className="space-y-12">
            {/* 2020 */}
            <div className="flex items-center space-x-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-lg">
                2020
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.ourStory?.year2020Title || 'The Beginning'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t.ourStory?.year2020Text || 'Founded with a vision to democratize investing. Started with a small team of financial experts and technologists.'}
                </p>
              </div>
            </div>

            {/* 2021 */}
            <div className="flex items-center space-x-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-lg">
                2021
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.ourStory?.year2021Title || 'First Platform Launch'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t.ourStory?.year2021Text || 'Launched our first investment platform with basic tools and educational resources for small investors.'}
                </p>
              </div>
            </div>

            {/* 2022 */}
            <div className="flex items-center space-x-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-lg">
                2022
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.ourStory?.year2022Title || 'AI Integration'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t.ourStory?.year2022Text || 'Introduced AI-powered investment advice and portfolio analysis tools, making professional guidance accessible to all.'}
                </p>
              </div>
            </div>

            {/* 2023 */}
            <div className="flex items-center space-x-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-lg">
                2023
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.ourStory?.year2023Title || 'Global Expansion'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t.ourStory?.year2023Text || 'Expanded to multiple countries and introduced multi-language support to serve investors worldwide.'}
                </p>
              </div>
            </div>

            {/* 2024 */}
            <div className="flex items-center space-x-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-lg">
                2024
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.ourStory?.year2024Title || 'Innovation Leader'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t.ourStory?.year2024Text || 'Recognized as a leading fintech platform with advanced tools, comprehensive education, and a growing community of empowered investors.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t.ourStory?.valuesTitle || 'Our Core Values'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.ourStory?.valuesSubtitle || 'The principles that guide everything we do'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Eye className="h-10 w-10 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.transparencyTitle || 'Transparency'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.transparencyText || 'We believe in complete transparency in all our operations and fees.'}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.careTitle || 'Care'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.careText || 'We genuinely care about our users\' financial success and well-being.'}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Lightbulb className="h-10 w-10 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.innovationTitle || 'Innovation'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.innovationText || 'Constantly innovating to provide the best tools and experience.'}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-10 w-10 text-orange-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.accessibilityTitle || 'Accessibility'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.accessibilityText || 'Making professional tools accessible to everyone, everywhere.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t.ourStory?.teamTitle || 'Meet Our Team'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.ourStory?.teamSubtitle || 'Passionate experts dedicated to empowering small investors'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-blue-100 p-4 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.team1Name || 'Financial Experts'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.team1Desc || 'Certified financial advisors with decades of experience in investment management.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-green-100 p-4 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.team2Name || 'Technology Team'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.team2Desc || 'Innovative developers and engineers building cutting-edge investment tools.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-purple-100 p-4 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-12 w-12 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.ourStory?.team3Name || 'Customer Success'}
              </h3>
              <p className="text-gray-600">
                {t.ourStory?.team3Desc || 'Dedicated support team ensuring every user gets the help they need.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t.ourStory?.ctaTitle || 'Join Our Story'}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.ourStory?.ctaText || 'Be part of the revolution that\'s making professional investing accessible to everyone. Start your investment journey with us today.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              {t.ourStory?.ctaButton1 || 'Start Investing'}
            </a>
            <a
              href="/contact"
              className="border-2 border-blue-700 text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {t.ourStory?.ctaButton2 || 'Get in Touch'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;
