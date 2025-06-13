import { Block } from "@/lib/types";
import React from "react";
import { BlockParser } from "./block-parser";
import Parser from "html-react-parser";

export function Fallback({ ...block } : Block) {
  const { innerHTML, innerBlocks, data } = block;

  // Regex matches opneing tag, tag attributes and inner content.
  const tagRegex = /<(\w+)([^>]*)>\s*([\s\S]*?)\s*<\/\1>/;
  const tagMatch = innerHTML.match(tagRegex);

  let tagName = 'div';
  let tagHtml = '';
  let tagAtts: any = {};
  if (tagMatch) {
    tagName = tagMatch[1];
    const rawAttributes = tagMatch[2];
    tagHtml = tagMatch[3];
    tagAtts = (rawAttributes
      .trim()
      .match(/([^\s=]+)(?:="([^"]*)")?/g) || []
    ).reduce((acc: Record<string, any>, attr: string) => {
      if (typeof attr === 'string') {
        const [key, value] = attr.split(/=(.+)/);
        if (key) {
          const keyVar = key === "class" ? "className" : key;
          if (keyVar === "style" && value) {
            acc[keyVar] = value
              .replace(/['"]/g, "")
              .split(";")
              .filter(Boolean)
              .reduce((styleObj: Record<string, string>, declaration: string) => {
                const [prop, val] = declaration.split(":");
                if (prop && val) {
                  const camelCaseProp = prop.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
                  styleObj[camelCaseProp] = val.trim();
                }
                return styleObj;
              }, {});
          } else {
            acc[keyVar] = value ? value.replace(/['"]/g, "") : true;
          }
        }
      }
      return acc;
    }, {} as Record<string, any>);
  }

  const Tag: any = tagName;

  return (
    <>
      {(innerBlocks && innerBlocks.length > 0) ? (
        <Tag {...tagAtts}>
          {Parser(tagHtml)}
          <BlockParser blocks={innerBlocks} />
        </Tag>
      ) : (
        Parser(innerHTML)
      )}
    </>
  );
}
