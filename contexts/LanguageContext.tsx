import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations, currencyData } from '../lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, vars?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    // Check for saved language in localStorage, default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (langCode: string) => {
    setLanguageState(langCode);
  };

  const t = useCallback((key: string, vars?: { [key: string]: string | number }): string => {
    let translation = translations[language]?.[key] || translations['en']?.[key] || key;

    if (vars) {
      Object.keys(vars).forEach(varKey => {
        const regex = new RegExp(`{{${varKey}}}`, 'g');
        translation = translation.replace(regex, String(vars[varKey]));
      });
    }

    const formatCurrency = (amountInr: number): string => {
        if (language === 'en' || language === 'hi') {
          return `₹${amountInr}`;
        }
        const currency = currencyData[language];
        if (currency) {
          const convertedAmount = amountInr * currency.rate;
          const roundedAmount = Math.round(convertedAmount);
           if (['id', 'vi', 'ja', 'ko', 'fa', 'my', 'uz', 'hu'].includes(language)) {
            return `${currency.symbol}${roundedAmount.toLocaleString('en-US')}`;
          }
          return `${currency.symbol}${roundedAmount}`;
        }
        // Fallback to USD if no specific currency data is available.
        const amountUsd = Math.round(amountInr / 83); // Approx 1 USD = 83 INR
        return `$${amountUsd}`;
    };
    
    translation = translation.replace(/{{amount500}}/g, formatCurrency(500));
    translation = translation.replace(/{{amount400}}/g, formatCurrency(400));

    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};