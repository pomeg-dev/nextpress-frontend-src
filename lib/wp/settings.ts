const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSettings() {
  const url = `${API_URL}/wp-json/nextpress/settings`;

  console.log('SETTINGS URL:', url);

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["settings"] },
    cache: "force-cache",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}