import { cache } from "react";
import { SETTINGS_KEYS } from "@/utils/settings-keys";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function _getSettings(keys?: string[]) {
  let url = `${API_URL}/wp-json/nextpress/settings`;
  const tags: string[] = [];
  
  if (keys && keys.length > 0) {
    // Add individual key tags
    keys.forEach(key => {
      if (SETTINGS_KEYS.includes(key)) {
        tags.push(key);
      }
    });
    
    const keysParam = keys.join(',');
    url += `?keys=${encodeURIComponent(keysParam)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    next: { 
      tags: tags,
      revalidate: 604800, // 1 week
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