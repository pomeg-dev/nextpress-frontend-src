import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const cacheControl: RequestCache = "force-cache";

export const getSettings = cache(async function getSettings() {
  const url = `${API_URL}/wp-json/nextpress/settings`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["settings"] },
    cache: cacheControl,
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
});