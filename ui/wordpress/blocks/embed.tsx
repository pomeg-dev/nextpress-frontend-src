import React from "react";
import { Block } from "@/lib/types";
import classNames from "classnames";


const Embed: React.FC<Block> = ({ ...block }: Block) => {
  const { data, className } = block;
  const isVideo = data?.url ? /vimeo|youtube|youtu\.be/i.test(data.url) : false;
  return (
    <figure className={classNames(
      "wp-block-embed relative my-4",
      data?.providerNameSlug && `is-provider-${data.providerNameSlug}`,
      data?.type && `is-type-${data.type}`,
      isVideo && "aspect-video",
      className,
    )}>
      {data?.url &&
        <iframe 
          className={classNames(
            "h-full w-full",
            isVideo && "absolute"
          )}
          src={data.url} 
          frameBorder="0">
        </iframe>
      }
    </figure>
  );
};

export default Embed;
