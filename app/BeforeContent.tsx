import { BlockParser } from "@/ui/block-parser";
import React from "react";

type BeforeContentProps = { defaultTemplate: any };

const BeforeContent = ({ defaultTemplate }: BeforeContentProps) => {
  return (
    <>
      {defaultTemplate.before_content && (
        <BlockParser blocks={defaultTemplate.before_content} />
      )}
    </>
  );
};

export default BeforeContent;
