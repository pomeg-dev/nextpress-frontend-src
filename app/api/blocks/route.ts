import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type BlockFields = {
  key?: string;
  label: string;
  type: string;
};

type Block = {
  id: string;
  blockName: string;
  fields: BlockFields[];
};

type ThemeBlocks = {
  [theme: string]: Block[];
};

export async function GET(request: NextRequest) {
  const themeParam = request.nextUrl.searchParams.get("theme");
  const themesDirectory = path.join(process.cwd(), "themes");

  try {
    if (themeParam) {
      const themes = themeParam.split(",").map((t) => t.trim());
      let allBlocks: Block[] = [];
      for (const theme of themes) {
        const blocks = await safelyGetThemeBlocks(theme, themesDirectory);
        allBlocks = allBlocks.concat(blocks);
      }
      return NextResponse.json(allBlocks);
    } else {
      const themes = await fs.readdir(themesDirectory);
      const themeBlocks: ThemeBlocks = {};

      for (const theme of themes) {
        const blocks = await safelyGetThemeBlocks(theme, themesDirectory);
        if (blocks.length > 0) {
          themeBlocks[theme] = blocks;
        }
      }

      return NextResponse.json(themeBlocks);
    }
  } catch (error) {
    console.error("Error reading themes directory:", error);
    return NextResponse.json(
      { error: "Unable to retrieve blocks" },
      { status: 500 }
    );
  }
}

async function safelyGetThemeBlocks(
  theme: string,
  themesDirectory: string
): Promise<Block[]> {
  const themeBlocksDirectory = path.join(themesDirectory, theme, "blocks");
  try {
    await fs.access(themeBlocksDirectory);
    const files = await fs.readdir(themeBlocksDirectory);
    return await Promise.all(files.map((file) => getBlockInfo(theme, file)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(
        `Unexpected error accessing theme blocks directory ${theme}:`,
        error
      );
    }
    return [];
  }
}

async function getBlockInfo(theme: string, file: string): Promise<Block> {
  const blockDirectory = path.join(
    process.cwd(),
    "themes",
    theme,
    "blocks",
    file
  );
  const fieldsJsonPath = path.join(blockDirectory, "fields.json");

  let fields: BlockFields[] = [];

  try {
    const fieldsJsonContent = await fs.readFile(fieldsJsonPath, "utf-8");
    fields = JSON.parse(fieldsJsonContent);
  } catch (error) {
    // If there's an error reading the file, we'll return an empty array for fields
  }

  return {
    id: `${theme}--${path.basename(file)}`,
    blockName: path.basename(file),
    fields: fields,
  };
}
