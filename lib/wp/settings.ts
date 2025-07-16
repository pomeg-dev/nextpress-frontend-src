import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function _getSettings(keys?: string[]) {
  let url = `${API_URL}/wp-json/nextpress/settings`;
  const tags = ['settings'];
  
  if (keys && keys.length > 0) {
    if (keys.includes('before_content')) tags.push('before_content');
    if (keys.includes('after_content')) tags.push('after_content');
    const keysParam = keys.join(',');
    url += `?keys=${encodeURIComponent(keysParam)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    next: { 
      tags: tags,
      revalidate: 86400, // 1 day
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
export const getSettings = cache(_getSettings);