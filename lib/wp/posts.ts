import { WPQuery } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type GetPostsParams = WPQuery & {
  include_content?: boolean;
};

export async function getPosts(params: GetPostsParams = {}) {
  const queryParams = new URLSearchParams();

  // List of parameters that should be comma-separated when they're arrays
  const commaSeparatedParams = ["post__in", "category", "tag"]; // Add more as needed

  // Add each parameter to the query string if it's defined
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (commaSeparatedParams.includes(key)) {
          // Join array values with commas for specified parameters
          queryParams.append(key, value.join(","));
        } else {
          // For other array parameters, keep the original behavior
          value.forEach((item) => queryParams.append(key, item.toString()));
        }
      } else if (key === "include_content") {
        // Convert boolean to 0 or 1 for include_content
        queryParams.append(key, value ? "1" : "0");
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const url = `${API_URL}/wp-json/nextpress/posts${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["posts"] },
    cache: "no-cache",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

export async function getPostByPath(
  path?: string,
  includeContent: boolean = true,
  isDraft: boolean = false,
) {
  const baseUrl = `${API_URL}/wp-json/nextpress/router`;
  const fullPath = path && !isDraft ? `/${path}` : "";
  const queryParams = new URLSearchParams({
    ...(includeContent && { include_content: includeContent.toString() }),
    ...(isDraft && { p: path })
  });
  const url = `${baseUrl}${fullPath}?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["post"] },
    cache: "no-cache",
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const res = await response.json();
  return res;
}

export type DefaultTemplateContent = {
  before_content: any[];
  after_content: any[];
};

export async function getDefaultTemplate(): Promise<DefaultTemplateContent> {
  const url = `${API_URL}/wp-json/nextpress/default-template`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["template"] },
    cache: "no-cache",
  });

  if (!response.ok) {
    console.error(`Failed to fetch default template: ${url}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res: DefaultTemplateContent = await response.json();
  return res;
}

export async function getRestPosts(
  postType: string = 'posts',
  params?: any,
  withHeaders: boolean = false
) {
  const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
  try {
    const response = await fetch(`${API_URL}/wp-json/wp/v2/${postType}${searchParams}`, {
      method: "GET",
      next: { tags: ["posts"] },
      cache: "force-cache",
    });
    
    if (withHeaders) {
      const res = {
        headers: response.headers,
        data: await response.json(),
      };
      return res;
    } else {
      const  res = await response.json();
      return res;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getTaxTerms(taxonomy: string) {
  try {
    const response = await fetch(`${API_URL}/wp-json/wp/v2/${taxonomy}`, {
      method: "GET",
      next: { tags: ["posts"] },
      cache: "force-cache",
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}