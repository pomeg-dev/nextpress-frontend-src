import React from "react";
import { Block } from "@/lib/types";
import Parser from "html-react-parser";

interface CodeProps extends Block {
  renderedChildren?: React.ReactNode;
}

const Code: React.FC<CodeProps> = ({ attrs, renderedChildren, innerHTML }) => {
  return <code>{Parser(innerHTML)}</code>;
};

export default Code;
