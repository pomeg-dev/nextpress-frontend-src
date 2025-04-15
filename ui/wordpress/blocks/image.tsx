import React from "react";
import { Block } from "@/lib/types";
import Parser from "html-react-parser";

type ImageProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Image: React.FC<ImageProps> = ({ ...block }: Block) => {
  const { data } = block;
  return Parser(block.innerHTML);
};

export default Image;
