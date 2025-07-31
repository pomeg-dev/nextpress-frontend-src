import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import classNames from "classnames";
import Image from "next/image";

type GroupProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Group: React.FC<GroupProps> = ({ ...block }: Block) => {
  const { innerBlocks, data } = block;
  const backgroundColor = data.attrs?.style?.color?.background || data.attrs?.backgroundColor;
  const textColor = data.attrs?.style?.color?.text || "primary";
  let invertColors = false;
  if (block.className && block.className.includes('animated-gradient')) {
    invertColors = true;
  }

  return (
    <div
      className={classNames(
        "core-block group-block relative overflow-hidden",
        invertColors &&
          "[&_.text-primary]:text-white [&_.text-white]:text-primary [&_.bg-primary]:bg-white [&_circle]:fill-white",
        data.attrs?.style?.color?.text && "has-text-color",
        block.className
      )}
      style={{
        color: textColor.includes('#') ? textColor : `var(--color-${textColor})`,
      }}
    >
      {block.className && block.className.includes('animated-gradient') &&
        <div className="animated-gradient absolute bottom-0 left-0 z-[-1] h-full w-full bg-secondary">
          <div className="color-1 absolute bottom-[-90%] left-[-15%] aspect-square h-full w-[40%] bg-white opacity-35 blur-[130px]"></div>
          <div className="color-2 absolute right-[-15%] top-[-90%] aspect-square h-full w-[40%] bg-tertiary opacity-60 blur-[130px]"></div>
        </div>
      }
      {block.className && block.className.includes('parallax-gradient') &&
        <div className="parallax-gradient absolute bottom-0 left-0 z-[-1] h-full w-full">
          <Image
            src="/images/orapharma-gradient.jpg"
            alt="gradient image"
            width={2326}
            height={3182}
          />
        </div>
      }
      {innerBlocks &&
        backgroundColor ? (
          <div
            className="has-background p-8"
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
