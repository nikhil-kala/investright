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
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-blue-700 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{t.header.brand}</span>
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
            <h4 className="font-semibold mb-6">{t.footer.support}</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">{t.footer.helpCenter}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.footer.contact}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a></li>
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