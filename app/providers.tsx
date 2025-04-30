"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { SessionProvider } from "next-auth/react";
import { domainLocales } from '@ui/utils/locales';
import Loader from '@ui/components/atoms/Loader';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}


export const LocaleContext = createContext({ locale: 'en' });

export function LocaleProvider({ children, defaultLocale = 'en' }: { children: React.ReactNode, defaultLocale?: string }) {
  const [locale, setLocale] = useState(defaultLocale);
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const detectedLocale = hostname in domainLocales ? domainLocales[hostname as keyof typeof domainLocales] : defaultLocale;
    
    import(`@themes/sommet/languages/${detectedLocale}.json`)
      .then((importedMessages) => {
        setLocale(detectedLocale);
        setMessages(importedMessages.default);
        setLoading(false);
      })
      .catch(() => {
        import(`@themes/sommet/languages/${defaultLocale}.json`)
          .then((importedMessages) => {
            setLocale(defaultLocale);
            setMessages(importedMessages.default);
            setLoading(false);
          });
      });
  }, [defaultLocale]);

  if (loading || !messages) {
    return <Loader isLoading={loading} />;
  }

  return (
    <LocaleContext.Provider value={{ locale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export const useLocaleContext = () => useContext(LocaleContext);