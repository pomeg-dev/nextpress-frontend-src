import { Block } from "@/lib/types";
import Parser from "html-react-parser";
import React from "react";
import { BlockParser } from "./block-parser";

export function CoreBlock({ ...block } : Block) {
  const { innerHTML, innerBlocks, data } = block;
  const tagRegex = /<(\w+)([^>]*)>/;
  const tagMatch = innerHTML.match(tagRegex);

  let tagName = 'div';
  let tagAtts: any = {};
  if (tagMatch) {
    tagName = tagMatch[1];
    const rawAttributes = tagMatch[2];
    tagAtts = rawAttributes
      .trim()
      .split(/\s+/)
      .reduce((acc: any, attr) => {
        const [key, value] = attr.split("=");
        if (key) {
          const keyVar = key === "class" ? "className" : key;
          acc[keyVar] = value ? value.replace(/['"]/g, "") : true;
        }
        return acc;
      }, {});
  }

  const Tag: any = tagName;

  return (
    <>
      {(innerBlocks && innerBlocks.length > 0) ? (
        <Tag {...tagAtts}>
          <BlockParser blocks={innerBlocks} />
        </Tag>
      ) : (
        Parser(innerHTML)
      )}
    </>
  );
}
