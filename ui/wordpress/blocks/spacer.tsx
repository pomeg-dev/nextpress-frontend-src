import React from "react";
import { Block } from "@/lib/types";
import Parser from "html-react-parser";

type SpacerProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Spacer: React.FC<SpacerProps> = ({ ...block }: Block) => {
  return Parser(block.innerHTML);
};

export default Spacer;
