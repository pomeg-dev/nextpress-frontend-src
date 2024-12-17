//@ts-nocheck

import React from "react";
import * as Fallback from "./fallback";
import { Block } from "@/lib/types";
import fs from "fs";
import path from "path";

const CMS_MODE = process.env.NEXT_PUBLIC_CMS_MODE;

type ImportedComponent = React.ComponentType<
  Block & { innerBlocks?: React.ReactNode }
>;

export function BlockParser({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockRenderer key={block.id ?? index} block={block} />
      ))}
    </>
  );
}

const getComponent = (mod: any): ImportedComponent => {
  return mod.default || (Object.values(mod)[0] as ImportedComponent);
};

const isDirectory = (path: string) => {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
};

const importComponent = async (
  componentPath: string,
  isThemeComponent: boolean = false
): Promise<ImportedComponent> => {
  try {
    let npModule;

    if (isThemeComponent) {
      // Check if the theme path exists and is a directory
      const themePath = path.join(
        process.cwd(),
        "themes",
        componentPath.split("/")[0]
      );
      if (!isDirectory(themePath)) {
        throw new Error(`Theme directory not found: ${themePath}`);
      }
      npModule = await import(`../../themes/${componentPath}`);
    } else {
      npModule = await import(`./${componentPath}`);
    }

    return getComponent(npModule);
  } catch (error) {
    console.error(`Failed to import component: ${componentPath}`, error);
    console.error("Import path attempted:", componentPath);
    return getComponent(Fallback);
  }
};

const BlockRenderer: React.FC<{ block: Block }> = async ({ block }) => {
  const { blockName, innerBlocks } = block;
  let ImportedComponent: ImportedComponent | null = null;

  if (blockName) {
    const [theme, componentName] = parseBlockName(blockName);

    // Only attempt to import from theme if it's actually a theme directory
    if (theme) {
      const themePath = path.join(process.cwd(), "themes", theme);
      if (!isDirectory(themePath)) {
        console.warn(
          `Skipping import from non-existent theme directory: ${theme}`
        );
        return null;
      }
    }

    if (CMS_MODE === "wordpress" && !theme) {
      ImportedComponent = await importComponent(
        `wordpress/blocks/${componentName}`,
        false
      );
    } else if (CMS_MODE === "strapi" && !theme) {
      // Strapi logic here...
    } else if (componentName) {
      ImportedComponent = await importComponent(
        `${theme}/blocks/${componentName}`,
        true
      );
    }
  }

  if (ImportedComponent) {
    return <ImportedComponent {...block} />;
  }

  if (innerBlocks && innerBlocks.length > 0) {
    return (
      <>
        {innerBlocks.map((innerBlock) => (
          <BlockRenderer key={innerBlock.id} block={innerBlock} />
        ))}
      </>
    );
  }

  return null;
};

function parseBlockName(blockName: string): [string | null, string] {
  const parts = blockName.split("--");
  if (parts.length > 1) {
    const theme = parts[0].replace("acf/", "");
    return [theme, parts[1]];
  }
  return [null, blockName.replace("core/", "")];
}
