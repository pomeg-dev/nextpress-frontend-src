import React from "react";
import { Block } from "@/lib/types";
import classNames from "classnames";


const Embed: React.FC<Block> = ({ ...block }: Block) => {
  const { data } = block;
  return (
    <figure className={classNames(
      "wp-block-embed aspect-video relative my-4",
      data?.providerNameSlug && `is-provider-${data.providerNameSlug}`,
      data?.type && `is-type-${data.type}`,
    )}>
      {data?.url &&
        <iframe className="absolute h-full w-full" src={data.url} frameBorder="0"></iframe>
      }
    </figure>
  );
};

export default Embed;
