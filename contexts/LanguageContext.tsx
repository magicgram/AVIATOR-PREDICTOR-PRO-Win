import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations, currencyData } from '../lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  t: (key: string, vars?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('currency') || 'INR';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const setLanguage = (langCode: string) => {
    setLanguageState(langCode);
  };

  const setCurrency = (currencyCode: string) => {
    setCurrencyState(currencyCode);
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
        const selectedCurrency = currencyData[currency];
        if (selectedCurrency) {
          const convertedAmount = amountInr * selectedCurrency.rate;
          const roundedAmount = Math.round(convertedAmount);
          // Special formatting for currencies that typically don't use decimals
          if (['IDR', 'VND', 'JPY', 'KRW', 'UZS', 'HUF'].map(c => c.toLowerCase()).includes(currency.toLowerCase())) {
            return `${selectedCurrency.symbol}${roundedAmount.toLocaleString('en-US')}`;
          }
          return `${selectedCurrency.symbol}${roundedAmount}`;
        }
        // Fallback to INR if something is wrong
        return `₹${amountInr}`;
    };
    
    // Base amount for first deposit is 1000 INR
    translation = translation.replace(/{{minDepositAmount}}/g, formatCurrency(1000));
    // Base amount for re-deposit is 400 INR (approx $5)
    translation = translation.replace(/{{minReDepositAmount}}/g, formatCurrency(400));

    return translation;
  }, [language, currency]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currency, setCurrency, t }}>
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
