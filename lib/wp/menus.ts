const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Menu = {
  id: number;
  name: string;
  slug: string;
  items: MenuItem[];
};

export type MenuItem = {
  id: number;
  title: string;
  url: string;
  menu_order: number;
  parent: number;
};

export async function getAllMenus() {
  const url = `${API_URL}/wp-json/nextpress/menus`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["menus"] },
    cache: "no-cache",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res: Menu[] = await response.json();
  return res;
}

export async function getMenuByLocation(location: string) {
  const url = `${API_URL}/wp-json/nextpress/menus/${encodeURIComponent(
    location
  )}`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["menu"] },
    cache: "no-cache",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res: Menu = await response.json();
  return res;
}
