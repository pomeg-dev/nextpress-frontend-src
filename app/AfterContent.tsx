import { BlockParser } from "@/ui/block-parser";
import React from "react";

type AfterContentProps = { defaultTemplate: any };

const AfterContent = ({ defaultTemplate }: AfterContentProps) => {
  return (
    <>
      {defaultTemplate.after_content && (
        <BlockParser blocks={defaultTemplate.after_content} />
      )}
    </>
  );
};

export default AfterContent;
