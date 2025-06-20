import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import classNames from "classnames";

type ColumnProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Column: React.FC<ColumnProps> = ({ ...block }: Block) => {
  const { innerBlocks, innerContent, data } = block;
  const backgroundColor = data?.style?.color?.background || data?.backgroundColor;
  const textColor = data?.style?.color?.text || data?.textColor;
  const columnWidth = data?.width;
  
  let flexBasis: string | undefined = undefined;
  if (innerContent?.[0]) {
    const flexBasisRegex = /flex-basis:\s*([^;'"]+)/;
    const flexBasisMatch = flexBasisRegex.exec(innerContent[0]);
    flexBasis = flexBasisMatch ? flexBasisMatch[1].trim() : undefined;
  }
  
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
        "core-block column-block wp-block-column",
        data?.style?.color?.background && "has-background-color",
        data?.style?.color?.text && "has-text-color",
        block?.className
      )}
      style={{
        ...(backgroundColor && {
          backgroundColor: backgroundColor.includes('#') 
            ? backgroundColor 
            : `var(--color-${backgroundColor})`
        }),
        ...(textColor && {
          color: textColor.includes('#') 
            ? textColor 
            : `var(--color-${textColor})`
        }),
        ...(flexBasis && { flexBasis }),
        ...(columnWidth && !flexBasis && { flexBasis: columnWidth }),
      }}
    >
      {innerBlocks && <BlockParser blocks={innerBlocks} />}
    </div>
  );
};

export default Column;