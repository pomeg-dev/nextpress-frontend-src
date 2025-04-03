import React from "react";
import { Block } from "@/lib/types";
import { BlockParser } from "../../block-parser";
import Parser from "html-react-parser";

type HeadingProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Heading: React.FC<HeadingProps> = ({ ...block }: Block) => {
  const { data } = block;
  const backgroundColor = data?.style?.color?.background || data?.backgroundColor || "transparent";
  const textColor = data?.style?.color?.text || data?.textColor || "primary";

  let styleStr = "";
  if (backgroundColor && backgroundColor !== "transparent") {
    const bgColor = backgroundColor.includes('#') 
      ? backgroundColor
      :`var(--color-${backgroundColor})` ;
    styleStr += `background-color: ${bgColor}; `;
  }
  
  if (textColor && textColor !== "primary") {
    const txtColor = textColor.includes('#') 
      ? textColor
      : `var(--color-${textColor})` ;
    styleStr += `color: ${txtColor}; `;
  }
  
  let modifiedHTML = block.innerHTML;
  if (styleStr) {
    modifiedHTML = block.innerHTML.replace(/<(h[1-6])(.*?)>/, `<$1$2 style="${styleStr}">`);
  }

  return Parser(modifiedHTML);
};

export default Heading;
