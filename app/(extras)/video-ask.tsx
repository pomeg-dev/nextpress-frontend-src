"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    VIDEOASK_EMBED_CONFIG?: {
      kind: string;
      url: string;
      options: {
        widgetType: string;
        text: string;
        backgroundColor: string;
        position: string;
        dismissible: boolean;
      };
    };
  }
}

export function VideoAsk({ videoask_url }: { videoask_url: string }) {
  useEffect(() => {
    window.VIDEOASK_EMBED_CONFIG = {
      kind: "widget",
      url: videoask_url,
      options: {
        widgetType: "VideoThumbnailWindow",
        text: "",
        backgroundColor: "#253645",
        position: "bottom-right",
        dismissible: true,
      },
    };
  }, [videoask_url]);

  return (
    <>
      {/* VideoAsk Embed Script */}
      <Script
        src="https://www.videoask.com/embed/embed.js"
        strategy="lazyOnload"
      />
    </>
  );
}