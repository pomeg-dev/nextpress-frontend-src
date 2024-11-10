import React from "react";
import { Block } from "../../../lib/types";
import { BlockParser } from "../../block-parser";
import Parser from "html-react-parser";

type HeadingProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Heading: React.FC<HeadingProps> = ({ ...block }: Block) => {
  // Example of using attrs
  const backgroundColor = block.attrs?.backgroundColor || "transparent";
  const padding = block.attrs?.padding || "0";

  return Parser(block.innerHTML);
};

export default Heading;
