import React from "react";
import { Block } from "@/lib/types";
import Parser from "html-react-parser";

interface SpacerProps extends Block {
  renderedChildren?: React.ReactNode;
}

const Spacer: React.FC<SpacerProps> = ({ attrs, renderedChildren, innerHTML }) => {
  return Parser(innerHTML);
};

export default Spacer;
