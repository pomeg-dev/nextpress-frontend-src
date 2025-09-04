"use client";

import { pageview } from "@/lib/gtm";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Object[];
    gtag?: (...args: any[]) => void;
  }
}

export function GTM({ GTM_ID }: { GTM_ID: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window.dataLayer?.find(item => 
      typeof item === 'object' && item !== null && 'gtm.start' in item
    )) {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
  }, []);

  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname, searchParams]);

  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
