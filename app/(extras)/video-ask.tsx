"use client";

import Script from "next/script";

export function VideoAsk({ videoask_url }: { videoask_url: string }) {
  return (
    <>
      {/* VideoAsk Embed Script */}
      <Script
        id="videoask-embed"
        dangerouslySetInnerHTML={{
          __html: `
            window.VIDEOASK_EMBED_CONFIG = {
              "kind": "widget",
              "url": "${videoask_url}",
              "options": {
                "widgetType": "VideoThumbnailWindow",
                "text": "",
                "backgroundColor": "#253645",
                "position": "bottom-right",
                "dismissible": true
              }
            };
          `,
        }}
      />
      <Script src="https://www.videoask.com/embed/embed.js" strategy="afterInteractive" />
    </>
  );
}