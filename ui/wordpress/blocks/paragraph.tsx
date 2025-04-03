import React from "react";
import { Block } from "@/lib/types";
import Parser from "html-react-parser";

interface ParagraphProps extends Block {
  renderedChildren?: React.ReactNode;
}

const Paragraph: React.FC<ParagraphProps> = ({ ...block }: Block) => {
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
    modifiedHTML = block.innerHTML.replace(/<(p)(.*?)>/, `<$1$2 style="${styleStr}">`);
  }

  return Parser(modifiedHTML);
};

export default Paragraph;
