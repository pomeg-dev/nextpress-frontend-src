import React from "react";
import { Block } from "@/lib/types";
import Button from "@ui/components/atoms/Button";

interface ButtonProps extends Block {
  renderedChildren?: React.ReactNode;
}

const ButtonBlock: React.FC<ButtonProps> = ({ ...block }: Block) => {
  const { data } = block;
  const extractButtonProps = (html: string) => {
    let buttonProps = {
      href: "#",
      target: "",
      rel: "",
      text: "Button"
    };

    const anchorRegex = /<a[^>]*class="[^"]*wp-block-button__link[^"]*"[^>]*>(.*?)<\/a>/;
    const hrefRegex = /href="([^"]*)"/;
    const targetRegex = /target="([^"]*)"/;
    const relRegex = /rel="([^"]*)"/;
    
    const anchorMatch = html.match(anchorRegex);
    
    if (anchorMatch) {
      const anchorTag = anchorMatch[0];
      const innerText = anchorMatch[1];
      
      const hrefMatch = anchorTag.match(hrefRegex);
      const targetMatch = anchorTag.match(targetRegex);
      const relMatch = anchorTag.match(relRegex);
      
      buttonProps = {
        href: hrefMatch ? hrefMatch[1] : "#",
        target: targetMatch ? targetMatch[1] : "",
        rel: relMatch ? relMatch[1] : "",
        text: innerText ? innerText.trim() : "Button"
      };
    }

    return buttonProps;
  };

  const buttonProps = extractButtonProps(block.innerHTML);
  const backgroundColor = data?.style?.color?.background || data?.backgroundColor || "bg-blue-600";
  const textColor = data?.style?.color?.text || data?.textColor || "text-white";
  
  return (
    <Button
      size="md"
      style="primary"
      linkItem={{
        url: buttonProps.href,
        target: buttonProps.target,
        title: buttonProps.text,
      }}
    />
  );
};

export default ButtonBlock;