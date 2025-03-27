import { BlockParser } from "@/ui/block-parser";
import React from "react";

const AfterContent = ({ settings }: any) => {
  return (
    <>
      {settings.after_content && (
        <BlockParser blocks={settings.after_content} />
      )}
    </>
  );
};

export default AfterContent;
