const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const cacheControl: RequestCache =
//   process.env.VERCEL_ENV === "production" ? "force-cache" : "no-store";
const cacheControl: RequestCache = "force-cache";

export async function getPostByPath(path: string) {
  try {
    let url = `${API_URL}/wp-json/nextpress/router/${path}`;
    const response = await fetch(url, {
      method: "GET",
      cache: cacheControl,
      next: { tags: ["post"] },
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllPages() {
  try {
    const response = await fetch(`${API_URL}/wp-json/wp/v2/pages/`, {
      method: "GET",
      cache: cacheControl,
      next: { tags: ["posts"] },
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getPage(req: any) {
  try {
    if (!isNaN(req)) {
      //if it is a number (post id)
      const response = await fetch(
        `${API_URL}/wp-json/wp/v2/pages/${req.toString()}`,
        {
          method: "GET",
          cache: cacheControl,
          next: { tags: ["posts"] },
        }
      );
      const res = await response.json();
      return res;
    } else {
      //if its a slug
      const response = await fetch(
        `${API_URL}/wp-json/wp/v2/pages?slug=${req}`,
        {
          method: "GET",
          cache: cacheControl,
          next: { tags: ["posts"] },
        }
      );
      const res = await response.json();
      return res[0];
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getPostByID(id: number | string) {
  console.log("gettting post by id", id);
  try {
    const allPosts: Record<string, any[]> = await getAllPostsArray(
      id.toString(),
      true
    );
    let foundPost = null;
    Object.entries(allPosts).forEach(([postType, posts]) => {
      posts.forEach((post: any) => {
        if (post.ID == id) foundPost = post;
      });
    });
    return foundPost;
  } catch (error) {
    console.error(error);
  }
}

export async function getPostBySlug(slug: string | undefined) {
  try {
    const allPosts: Record<string, any[]> = await getAllPostsArray();
    let foundPost = null;
    Object.entries(allPosts).forEach(([postType, posts]) => {
      posts.forEach((post: any) => {
        if (post.post_name === slug) foundPost = post;
      });
    });
    return foundPost;
  } catch (error) {
    console.error(error);
  }
}

export async function getAttachment(id: number | string) {
  try {
    const response = await fetch(
      `${API_URL}/wp-json/wp/v2/media/${id.toString()}`,
      {
        method: "GET",
        cache: cacheControl,
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getPosts() {
  try {
    const response = await fetch(`${API_URL}/wp-json/wp/v2/posts`, {
      method: "GET",
      next: { tags: ["posts"] },
      cache: cacheControl,
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllPostsArray(slug?: string, includeDrafts?: boolean) {
  try {
    let url = `${API_URL}/wp-json/next-gutenberg/posts?slug=${slug}`;
    if (includeDrafts) url += "&include_drafts=true";
    const response = await fetch(url, {
      method: "GET",
      next: { tags: ["posts"] },
      cache: cacheControl,
    });
    const res = await response.json();
    // console.log("res", res);
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getMenu(slug: string) {
  try {
    const response = await fetch(
      `${API_URL}/wp-json/next-gutenberg/menus/?slug=${slug}`,
      {
        method: "GET",
        next: { tags: ["posts"] },
        cache: cacheControl,
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllMenus(slug?: string) {
  try {
    const response = await fetch(
      `${API_URL}/wp-json/next-gutenberg/menus?slugstring=${slug}`,
      {
        method: "GET",
        next: { tags: ["menus"] },
        cache: cacheControl,
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getSettings(slug?: string) {
  try {
    const apiUrl = `${API_URL}/wp-json/next-gutenberg/settings?slug=${slug}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      next: { tags: ["settings"] },
      cache: cacheControl,
    });

    const data = await response.json();

    if (data === undefined) {
      throw new Error("data is undefined");
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getSettingsByPostId(id: number) {
  try {
    const response = await fetch(
      `${API_URL}/wp-json/next-gutenberg/settings/${id}`,
      {
        method: "GET",
        next: { tags: ["settings", "posts"] },
        cache: cacheControl,
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}
