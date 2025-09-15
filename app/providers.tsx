"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../ui/languages/en.json';
import frMessages from '../../ui/languages/fr.json';

export const LocaleContext = createContext({ 
  locale: 'en', 
  setLocale: (locale: string) => {} 
});

const messages = {
  en: enMessages,
  fr: frMessages,
} as const;

function HTMLLangUpdater() {
  const { locale } = useLocaleContext();
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  
  return null;
}

export function LocaleProvider({ children, defaultLocale = 'en' }: { children: React.ReactNode, defaultLocale?: string }) {
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    const pathname = window.location.pathname;
    let detectedLocale = defaultLocale;
    if (pathname.startsWith('/en/') || pathname === '/en') {
      detectedLocale = 'en';
    }
    
    if (messages[detectedLocale as keyof typeof messages]) {
      setLocale(detectedLocale);
    } else {
      setLocale(defaultLocale);
    }
  }, [defaultLocale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <HTMLLangUpdater />
      <NextIntlClientProvider 
        locale={locale} 
        messages={messages[locale as keyof typeof messages] || messages[defaultLocale as keyof typeof messages]}
        timeZone="UTC"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export const useLocaleContext = () => useContext(LocaleContext);