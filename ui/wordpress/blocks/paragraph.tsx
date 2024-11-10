import React from "react";
import { Block } from "../../../lib/types";
import Parser from "html-react-parser";

interface ParagraphProps extends Block {
  renderedChildren?: React.ReactNode;
}

const Paragraph: React.FC<ParagraphProps> = ({
  attrs,
  renderedChildren,
  innerHTML,
}) => {
  return <>{Parser(innerHTML)}</>;
};

export default Paragraph;
