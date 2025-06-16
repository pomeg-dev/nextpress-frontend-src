import { WPQuery } from "@/lib/types";
import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// const cacheControl: RequestCache =
//   process.env.VERCEL_ENV === "production" ? "force-cache" : "no-store";
// const cacheControl: RequestCache = "force-cache";

export type GetPostsParams = WPQuery & {
  include_content?: boolean;
  include_metadata?: boolean;
  slug_only?: boolean;
};

export const getPosts = cache(async function getPosts(
  params: GetPostsParams = {},
  withHeaders: boolean = false
) {
  const queryParams = new URLSearchParams();

  // List of parameters that should be comma-separated when they're arrays
  const commaSeparatedParams = [
    "post__in", 
    "post__not_in", 
    "category", 
    "tag", 
    "tag_id",
    "category__in",
    "tag__in",
  ]; // Add more as needed

  // Add each parameter to the query string if it's defined
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (commaSeparatedParams.includes(key) || key.includes('filter_')) {
          // Join array values with commas for specified parameters
          queryParams.append(key, value.join(","));
        } else {
          // For other array parameters, keep the original behavior
          value.forEach((item) => queryParams.append(key, item.toString()));
        }
      } else if (key === "include_content" || key === "include_metadata" || key === "slug_only") {
        // Convert boolean to 0 or 1
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
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json()
  return withHeaders ? { posts: res, headers: response.headers } : res;
});

export const getPostByPath = cache(async function getPostByPath(
  path?: string,
  includeContent: boolean = true,
  isDraft: boolean = false,
) {
  if (path?.includes('devtools')) return;
  const baseUrl = `${API_URL}/wp-json/nextpress/router`;
  const fullPath = path && !isDraft ? `/${path}` : "";
  const queryParams = new URLSearchParams({
    ...(includeContent && { include_content: includeContent.toString() }),
    ...(isDraft && { p: path })
  });
  const url = `${baseUrl}${fullPath}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      next: { tags: ["post"] },
      cache: "force-cache",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const res = await response.json();
    return res;
    
  } catch (error) {
    throw error;
  }
});

export type DefaultTemplateContent = {
  before_content: any[];
  after_content: any[];
};

export async function getDefaultTemplate(): Promise<DefaultTemplateContent> {
  const url = `${API_URL}/wp-json/nextpress/default-template`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["template"] },
    cache: "force-cache",
  });

  if (!response.ok) {
    console.error(`Failed to fetch default template: ${url}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res: DefaultTemplateContent = await response.json();
  return res;
}

export async function getTaxTerms(taxonomy: string) {
  const url = `${API_URL}/wp-json/nextpress/tax_list/${encodeURIComponent(
    taxonomy
  )}`;
  
  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["template"] },
    cache: "force-cache",
  });

  if (!response.ok) {
    console.error(`Failed to fetch default template: ${url}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

export async function getTaxTerm(taxonomy: string, term: string) {
  const url = `${API_URL}/wp-json/nextpress/tax_term/${encodeURIComponent(taxonomy)}/${encodeURIComponent(term)}`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["template"] },
    cache: "force-cache",
  });

  if (!response.ok) {
    console.error(`Failed to fetch default template: ${url}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}