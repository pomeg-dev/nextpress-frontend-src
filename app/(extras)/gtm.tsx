"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function GTM({ GTM_ID }: { GTM_ID: string }) {
  const pathname = usePathname();

  //on path change, fire pageview
  useEffect(() => {
    pageview(pathname);
  }, [pathname]);

  return <GoogleTagManager gtmId={GTM_ID} />;
}

function pageview(url: string) {
  (window as any).dataLayer?.push({
    event: "pageview",
    page: url,
  });
}
