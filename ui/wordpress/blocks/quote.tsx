import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import classNames from "classnames";

type QuoteProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Quote: React.FC<QuoteProps> = ({ ...block }: Block) => {
  const { innerBlocks, innerContent, data } = block;
  const backgroundColor = data?.style?.color?.background || data?.backgroundColor;
  const textColor = data?.style?.color?.text;
  let id: string | undefined = undefined;
  if (innerContent?.[0]) {
    const regex = /id=["']([^"']*)["']/;
    const match = regex.exec(innerContent?.[0]);
    id = match ? match[1] : undefined;
  }

  return (
    <blockquote
      id={id}
      className={classNames(
        "core-block quote relative overflow-hidden",
        data?.style?.color?.text && "has-text-color",
        block?.className
      )}
      style={{
        ...(textColor && {
          color: textColor.includes('#') ? textColor : `var(--color-${textColor})`
        }),
        ...(backgroundColor && {
          backgroundColor: backgroundColor.includes('#') ? backgroundColor : `var(--color-${backgroundColor})`
        })
      }}
    >
      {innerBlocks &&
      <BlockParser blocks={innerBlocks} />
      }
    </blockquote>
  );
};

export default Quote;
