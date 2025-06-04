import { Block, Post } from "./types";

export const makeRepeated = (arr: any, repeats: number) =>
  [].concat(...Array.from({ length: repeats }, () => arr));

export function getAllCategoriesFromPosts(posts: any) {
  let allCategories: any = [];
  for (var i in posts) {
    for (var j in posts[i].category_names) {
      if (
        allCategories.some(
          (item: any) => item.id === posts[i].category_names[j].id
        )
      )
        continue;
      allCategories.push(posts[i].category_names[j]);
    }
  }
  //remove the "Uncategorized" category
  allCategories = allCategories.filter((item: any) => item.id !== 1);

  return allCategories;
}

export function getRepeaterData(array: any, key: string) {
  if (typeof key !== "string") {
    throw new Error("Input key must be a string.");
  }

  const regex = new RegExp(`^${key}_(\\d+)_(.+)$`);

  const repeaterData: any = [];
  Object.entries(array).forEach(([dataKey, value]) => {
    const match = dataKey.match(regex);
    if (match) {
      const index = parseInt(match[1]);
      const property = match[2];

      if (!repeaterData[index]) {
        repeaterData[index] = {};
      }
      repeaterData[index][property] = value;
    }
  });

  return repeaterData.filter((data: any) => Object.keys(data).length !== 0);
}


export const parseTemplateBlocks = (
  postBlocks: Block[] = [], 
  settingsBlocks: Block[] = [], 
  post: Post,
  before: boolean = false,
) => {
  const headerFooterMap = new Map();
  postBlocks.forEach((block) => {
    if (block.blockName && 
        (block.blockName.toLowerCase().includes('header') || 
         block.blockName.toLowerCase().includes('footer'))) {
      headerFooterMap.set(block.blockName, block);
    }
  });
  
  const filteredSettingsBlocks = settingsBlocks.filter((block) => {
    if (!block.blockName) return true;
    
    return !headerFooterMap.has(block.blockName);
  });
  
  let blocks = before ? 
    [...filteredSettingsBlocks, ...postBlocks] : 
    [...postBlocks, ...filteredSettingsBlocks];
  
  blocks = additionalPostData(blocks, post);
  return blocks;
};

export const additionalPostData = (blocks: Block[], post: Post) => {
  if (blocks && blocks.length > 0) {
    blocks.map((block: Block) => {
      if (!block.data) {
        block.data = {};
      }
      if (!block.data.current_post) {
        block.data.current_post = {...post};
      }
    });
  }
  return blocks;
};