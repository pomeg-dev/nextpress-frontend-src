import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function _getBlockTheme() {
  const url = `${API_URL}/wp-json/nextpress/block_theme`;

  const response = await fetch(url, {
    method: "GET",
    next: { 
      tags: ["block_theme"],
      revalidate: 86400 // 24 hours (1 day)
    },
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

// React cache() deduplicates calls within a single request
export const getBlockTheme = cache(_getBlockTheme);