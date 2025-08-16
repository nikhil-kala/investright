import { useState, useEffect } from 'react';
import { Language } from '../types/language';
import { translations } from '../data/translations';

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('preferred-language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  const t = translations[currentLanguage];

  return {
    currentLanguage,
    changeLanguage,
    t
  };
}