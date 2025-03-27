import { BlockParser } from "@/ui/block-parser";
import React from "react";

const BeforeContent = ({ settings }: any) => {
  return (
    <>
      {settings.before_content && (
        <BlockParser blocks={settings.before_content} />
      )}
    </>
  );
};

export default BeforeContent;
