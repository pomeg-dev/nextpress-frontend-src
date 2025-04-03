import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import classNames from "classnames";

type GroupProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Group: React.FC<GroupProps> = ({ ...block }: Block) => {
  const { innerBlocks, innerContent, data } = block;
  const backgroundColor = data?.style?.color?.background || data?.backgroundColor;
  const textColor = data?.style?.color?.text || data?.textColor || "primary";
  let id: string | undefined = undefined;
  if (innerContent?.[0]) {
    const regex = /id=["']([^"']*)["']/;
    const match = regex.exec(innerContent?.[0]);
    id = match ? match[1] : undefined;
  }

  return (
    <div
      id={id}
      className={classNames(
        "core-block group-block relative overflow-hidden",
        data?.style?.color?.text && "has-text-color",
        block?.className
      )}
      style={{
        ...(textColor && {
          color: textColor.includes('#') ? textColor : `var(--color-${textColor})`
        }),
      }}
    >
      {innerBlocks &&
        backgroundColor ? (
          <div
            className="has-background break-out"
            style={{
              backgroundColor: 
                backgroundColor.includes('#') ? backgroundColor : `var(--color-${backgroundColor})`,
            }}
          >
            <div className="container py-lg">
              <BlockParser blocks={innerBlocks} />
            </div>
          </div>
        ) : (
          <BlockParser blocks={innerBlocks} />
        )
      }
    </div>
  );
};

export default Group;
