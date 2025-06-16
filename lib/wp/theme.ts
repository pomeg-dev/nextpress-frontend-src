import { WPQuery } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

//route for getting /wp-json/nextpress/block_theme
export async function getBlockTheme() {
  const url = `${API_URL}/wp-json/nextpress/block_theme`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["block_theme"] },
    cache: "force-cache",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}