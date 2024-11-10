// THIS IS USED FOR core/block block. used in reusable blocks and patterns

import React from "react";
import { Block } from "../../../lib/types";
import { BlockParser } from "../../block-parser";

type CoreBlockProps = Block & {
  innerBlocks?: React.ReactNode;
};

const CoreBlock: React.FC<CoreBlockProps> = ({ ...block }: Block) => {
  return <BlockParser blocks={block.innerBlocks} />;
};

export default CoreBlock;
