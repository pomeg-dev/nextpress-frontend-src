import React from "react";
import { Block } from "../../../lib/types";
import { BlockParser } from "../../block-parser";

type GroupProps = Block & {
  innerBlocks?: React.ReactNode;
};

const Group: React.FC<GroupProps> = ({ ...block }: Block) => {
  // Example of using attrs
  const backgroundColor = block.attrs?.backgroundColor || "transparent";
  const padding = block.attrs?.padding || "0";

  return (
    <div className="group" style={{ backgroundColor, padding }}>
      <BlockParser blocks={block.innerBlocks} />
    </div>
  );
};

export default Group;
