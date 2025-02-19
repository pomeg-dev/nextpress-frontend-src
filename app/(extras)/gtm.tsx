"use client";

import { pageview } from "@/lib/gtm";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export function GTM({ GTM_ID }: { GTM_ID: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        onLoad={() => {
          // Track initial page load
          pageview(window.location.pathname);
        }}
      />
    </>
  );
}
