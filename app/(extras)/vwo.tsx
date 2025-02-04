"use client";

import Script from "next/script";

export function VWO({ accountId }: { accountId: string }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
    return null;
  }

  return (
    <>
      {/* VWO Async SmartCode */}
      <link rel="preconnect" href="https://dev.visualwebsiteoptimizer.com" />
      <Script
        id="vwoCode"
        strategy="lazyOnload"
        src={`https://dev.visualwebsiteoptimizer.com/j.php?a=${accountId}&x=true`}
      />
    </>
  );
}