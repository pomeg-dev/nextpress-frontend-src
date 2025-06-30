import React from "react";
import { Block } from "@/lib/types";
import classNames from "classnames";

const Embed: React.FC<Block> = ({ ...block }: Block) => {
  const { data, className } = block;
  const isVideo = data?.url ? /vimeo|youtube|youtu\.be/i.test(data.url) : false;
  
  // Function to convert YouTube URLs to embed format
  const getEmbedUrl = (url: string): string => {
    if (!url) return url;
    
    // YouTube URL patterns
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    
    // Handle YouTube URLs
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const embedUrl = data?.url ? getEmbedUrl(data.url) : '';

  return (
    <figure className={classNames(
      "wp-block-embed relative my-4",
      data?.providerNameSlug && `is-provider-${data.providerNameSlug}`,
      data?.type && `is-type-${data.type}`,
      isVideo && "aspect-video",
      className,
    )}>
      {embedUrl && (
        <iframe 
          className={classNames(
            "h-full w-full",
            isVideo && "absolute"
          )}
          src={embedUrl} 
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </figure>
  );
};

export default Embed;