import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import classNames from "classnames";

type GroupProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Group: React.FC<GroupProps> = ({ ...block }: Block) => {
  const { innerBlocks, data } = block;
  const backgroundColor = data.attrs?.backgroundColor;
  const textColor = data.attrs?.style?.color?.text || "primary";

  return (
    <div
      className="core-block group"
      style={{
        color: textColor.includes('#') ? textColor : `var(--color-${textColor})`,
      }}
    >
      {innerBlocks &&
        backgroundColor ? (
          <div
            className="mb-4 p-8"
            style={{
              backgroundColor: 
                backgroundColor.includes('#') ? backgroundColor : `var(--color-${backgroundColor})`,
            }}
          >
            <BlockParser blocks={innerBlocks} />
          </div>
        ) : (
          <BlockParser blocks={innerBlocks} />
        )
      }
    </div>
  );
};

export default Group;
