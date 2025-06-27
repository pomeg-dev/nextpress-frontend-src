import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function _getSettings(keys?: string[]) {
  let url = `${API_URL}/wp-json/nextpress/settings`;
  
  if (keys && keys.length > 0) {
    const keysParam = keys.join(',');
    url += `?keys=${encodeURIComponent(keysParam)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    next: { 
      tags: ["settings"],
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
export const getSettings = cache(_getSettings);