import { WPQuery } from "@/lib/types";
import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Debug: Log environment info
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🌐 API URL:', API_URL);
console.log('⏰ Server time:', new Date().toISOString());

const cacheControl: RequestCache = process.env.NODE_ENV === 'development' 
  ? 'no-store' 
  : 'force-cache';

console.log('💾 Cache control:', cacheControl);

export type GetPostsParams = WPQuery & {
  include_content?: boolean;
  include_metadata?: boolean;
  slug_only?: boolean;
};

export const getPosts = cache(async function getPosts(
  params: GetPostsParams = {},
  withHeaders: boolean = false
) {
  const functionStartTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [${requestId}] getPosts called at:`, new Date().toISOString());
  console.log(`📊 [${requestId}] Parameters:`, JSON.stringify(params, null, 2));
  
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
  ];

  // Add each parameter to the query string if it's defined
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (commaSeparatedParams.includes(key) || key.includes('filter_')) {
          queryParams.append(key, value.join(","));
        } else {
          value.forEach((item) => queryParams.append(key, item.toString()));
        }
      } else if (key === "include_content" || key === "include_metadata" || key === "slug_only") {
        queryParams.append(key, value ? "1" : "0");
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const url = `${API_URL}/wp-json/nextpress/posts${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  // Build granular cache tags
  const cacheTags = ["posts"];
  
  if (params.post_type) {
    const postTypes = Array.isArray(params.post_type) ? params.post_type : [params.post_type];
    postTypes.forEach(type => cacheTags.push(`posts-${type}`));
  }
  
  if (params.category) {
    const categories = Array.isArray(params.category) ? params.category : [params.category];
    categories.forEach(cat => cacheTags.push(`posts-category-${cat}`));
  }
  
  if (params.tag) {
    const tags = Array.isArray(params.tag) ? params.tag : [params.tag];
    tags.forEach(tag => cacheTags.push(`posts-tag-${tag}`));
  }
  
  if (params.author) {
    cacheTags.push(`posts-author-${params.author}`);
  }

  console.log(`🌐 [${requestId}] Fetching URL:`, url);
  console.log(`🏷️ [${requestId}] Cache tags:`, cacheTags);
  console.log(`⚙️ [${requestId}] Query params:`, queryParams.toString());

  const fetchStartTime = Date.now();
  
  try {
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ [${requestId}] Request timeout after 30s`);
      controller.abort();
    }, 30000);

    const response = await fetch(url, {
      method: "GET",
      next: { 
        tags: cacheTags,
        revalidate: 3600
      },
      cache: cacheControl,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`⏱️ [${requestId}] Network fetch took:`, fetchTime, 'ms');

    if (!response.ok) {
      console.error(`❌ [${requestId}] HTTP error:`, response.status, response.statusText);
      console.error(`❌ [${requestId}] Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check cache status
    const cacheStatus = response.headers.get('x-vercel-cache') || 
                       response.headers.get('cf-cache-status') || 
                       response.headers.get('x-cache') ||
                       'unknown';
    console.log(`💾 [${requestId}] Cache status:`, cacheStatus);

    // Monitor response size
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeKB = Math.round(parseInt(contentLength) / 1024);
      console.log(`📦 [${requestId}] Response size:`, sizeKB, 'KB');
      
      if (sizeKB > 500) {
        console.warn(`⚠️ [${requestId}] Large response detected! Consider pagination or field limiting.`);
      }
    }

    // Log response headers for debugging
    console.log(`📋 [${requestId}] Response headers:`, {
      'content-type': response.headers.get('content-type'),
      'x-wp-total': response.headers.get('x-wp-total'),
      'x-wp-totalpages': response.headers.get('x-wp-totalpages'),
      'cache-control': response.headers.get('cache-control'),
      'etag': response.headers.get('etag'),
    });

    const jsonStartTime = Date.now();
    const res = await response.json();
    const jsonTime = Date.now() - jsonStartTime;
    console.log(`🔄 [${requestId}] JSON parsing took:`, jsonTime, 'ms');
    
    // Monitor actual JSON size
    const jsonSize = JSON.stringify(res).length;
    const jsonSizeKB = Math.round(jsonSize / 1024);
    console.log(`📋 [${requestId}] JSON size:`, jsonSizeKB, 'KB');

    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ [${requestId}] Total getPosts time:`, totalTime, 'ms');
    console.log(`📄 [${requestId}] Returned`, Array.isArray(res) ? res.length : 'non-array', 'posts');

    // Performance warnings
    if (totalTime > 5000) {
      console.warn(`🐌 [${requestId}] Slow request detected (${totalTime}ms)! Consider optimization.`);
    }

    return withHeaders ? { posts: res, headers: response.headers } : res;
    
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`💥 [${requestId}] getPosts error after`, errorTime, 'ms:', error);
    
    if (error.name === 'AbortError') {
      console.error(`⏰ [${requestId}] Request was aborted due to timeout`);
    }
    
    throw error;
  }
});

export const getPostByPath = cache(async function getPostByPath(
  path?: string,
  includeContent: boolean = true,
  isDraft: boolean = false,
) {
  const functionStartTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [${requestId}] getPostByPath called:`, { path, includeContent, isDraft });
  
  if (path?.includes('devtools')) {
    console.log(`🚫 [${requestId}] Skipping devtools path`);
    return;
  }
  
  const baseUrl = `${API_URL}/wp-json/nextpress/router`;
  const fullPath = path && !isDraft ? `/${path}` : "";
  const queryParams = new URLSearchParams({
    ...(includeContent && { include_content: includeContent.toString() }),
    ...(isDraft && { p: path })
  });
  const url = `${baseUrl}${fullPath}?${queryParams.toString()}`;
  
  console.log(`🌐 [${requestId}] Fetching URL:`, url);
  
  const fetchStartTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ [${requestId}] Request timeout after 30s`);
      controller.abort();
    }, 30000);

    const response = await fetch(url, {
      method: "GET",
      next: { 
        tags: [
          "post", 
          `post-path-${path?.replace(/\//g, '-') || 'home'}`,
        ],
        revalidate: 3600
      },
      cache: cacheControl,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`⏱️ [${requestId}] Network fetch took:`, fetchTime, 'ms');
    
    if (!response.ok) {
      console.error(`❌ [${requestId}] HTTP error:`, response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cacheStatus = response.headers.get('x-vercel-cache') || 
                       response.headers.get('cf-cache-status') || 
                       'unknown';
    console.log(`💾 [${requestId}] Cache status:`, cacheStatus);
    
    const jsonStartTime = Date.now();
    const res = await response.json();
    const jsonTime = Date.now() - jsonStartTime;
    console.log(`🔄 [${requestId}] JSON parsing took:`, jsonTime, 'ms');
    
    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ [${requestId}] Total getPostByPath time:`, totalTime, 'ms');
    console.log(`📄 [${requestId}] Post data:`, { 
      id: res?.id, 
      title: res?.title?.rendered || res?.title,
      type: res?.type 
    });

    return res;
    
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`💥 [${requestId}] getPostByPath error after`, errorTime, 'ms:', error);
    throw error;
  }
});

export const getPostById = cache(async function getPostById(
  postId: string | number,
  includeContent: boolean = true
) {
  const functionStartTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [${requestId}] getPostById called:`, { postId, includeContent });
  
  const url = `${API_URL}/wp-json/nextpress/posts?post__in=${postId}&include_content=${includeContent ? '1' : '0'}`;
  console.log(`🌐 [${requestId}] Fetching URL:`, url);
  
  const fetchStartTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: "GET",
      next: { 
        tags: [
          "posts",
          "post", 
          `post-${postId}`
        ],
        revalidate: 3600
      },
      cache: cacheControl,
    });

    const fetchTime = Date.now() - fetchStartTime;
    console.log(`⏱️ [${requestId}] Network fetch took:`, fetchTime, 'ms');

    if (!response.ok) {
      console.error(`❌ [${requestId}] HTTP error:`, response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ [${requestId}] Total getPostById time:`, totalTime, 'ms');
    
    return res[0];
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`💥 [${requestId}] getPostById error after`, errorTime, 'ms:', error);
    throw error;
  }
});

export type DefaultTemplateContent = {
  before_content: any[];
  after_content: any[];
};

export async function getDefaultTemplate(): Promise<DefaultTemplateContent> {
  const functionStartTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [${requestId}] getDefaultTemplate called`);
  
  const url = `${API_URL}/wp-json/nextpress/default-template`;
  console.log(`🌐 [${requestId}] Fetching URL:`, url);

  try {
    const response = await fetch(url, {
      method: "GET",
      next: { 
        tags: ["template", "default-template"],
        revalidate: 7200
      },
      cache: cacheControl,
    });

    const fetchTime = Date.now() - functionStartTime;
    console.log(`⏱️ [${requestId}] Template fetch took:`, fetchTime, 'ms');

    if (!response.ok) {
      console.error(`❌ [${requestId}] Failed to fetch default template:`, response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res: DefaultTemplateContent = await response.json();
    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ [${requestId}] Total getDefaultTemplate time:`, totalTime, 'ms');
    
    return res;
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`💥 [${requestId}] getDefaultTemplate error after`, errorTime, 'ms:', error);
    throw error;
  }
}

export async function getTaxTerms(taxonomy: string) {
  const functionStartTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [${requestId}] getTaxTerms called:`, { taxonomy });
  
  const url = `${API_URL}/wp-json/nextpress/tax_list/${encodeURIComponent(taxonomy)}`;
  console.log(`🌐 [${requestId}] Fetching URL:`, url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      next: { 
        tags: [
          "taxonomy", 
          `taxonomy-${taxonomy}`,
          `tax-terms-${taxonomy}`
        ],
        revalidate: 1800
      },
      cache: cacheControl,
    });

    const fetchTime = Date.now() - functionStartTime;
    console.log(`⏱️ [${requestId}] Taxonomy terms fetch took:`, fetchTime, 'ms');

    if (!response.ok) {
      console.error(`❌ [${requestId}] Failed to fetch taxonomy terms:`, response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ [${requestId}] Total getTaxTerms time:`, totalTime, 'ms');
    console.log(`📄 [${requestId}] Returned`, Array.isArray(res) ? res.length : 'non-array', 'terms');
    
    return res;
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`💥 [${requestId}] getTaxTerms error after`, errorTime, 'ms:', error);
    throw error;
  }
}

export async function getTaxTerm(taxonomy: string, term: string) {
  const functionStartTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [${requestId}] getTaxTerm called:`, { taxonomy, term });
  
  const url = `${API_URL}/wp-json/nextpress/tax_term/${encodeURIComponent(taxonomy)}/${encodeURIComponent(term)}`;
  console.log(`🌐 [${requestId}] Fetching URL:`, url);

  try {
    const response = await fetch(url, {
      method: "GET",
      next: { 
        tags: [
          "taxonomy",
          `taxonomy-${taxonomy}`,
          `tax-term-${taxonomy}-${term}`
        ],
        revalidate: 1800
      },
      cache: cacheControl,
    });

    const fetchTime = Date.now() - functionStartTime;
    console.log(`⏱️ [${requestId}] Tax term fetch took:`, fetchTime, 'ms');

    if (!response.ok) {
      console.error(`❌ [${requestId}] Failed to fetch taxonomy term:`, response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ [${requestId}] Total getTaxTerm time:`, totalTime, 'ms');
    
    return res;
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`💥 [${requestId}] getTaxTerm error after`, errorTime, 'ms:', error);
    throw error;
  }
}

// Utility function to test WordPress API performance
export async function testWordPressAPI() {
  console.log('🧪 Testing WordPress API performance...');
  
  const testUrls = [
    `${API_URL}/wp-json/wp/v2/posts?per_page=1`,
    `${API_URL}/wp-json/nextpress/posts?per_page=1`,
    `${API_URL}/wp-json/nextpress/settings`,
    `${API_URL}/wp-json/nextpress/menus`,
  ];

  const results = [];

  for (const url of testUrls) {
    const start = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    try {
      console.log(`🧪 [${requestId}] Testing:`, url);
      
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'User-Agent': 'NextPress-Debug-Test'
        }
      });
      
      const time = Date.now() - start;
      const status = response.status;
      const size = response.headers.get('content-length');
      
      console.log(`✅ [${requestId}] ${url}: ${status} (${time}ms, ${size ? Math.round(parseInt(size)/1024) + 'KB' : 'unknown size'})`);
      
      results.push({ url, status, time, size });
      
    } catch (error) {
      const time = Date.now() - start;
      console.log(`❌ [${requestId}] ${url}: ERROR (${time}ms)`, error.message);
      results.push({ url, status: 'ERROR', time, error: error.message });
    }
  }

  console.log('🧪 API Test Results Summary:', results);
  return results;
}

// Function to monitor cache hit rates
export function logCachePerformance() {
  const cacheHits = { hits: 0, misses: 0, errors: 0 };
  
  // Override console.log to capture cache status logs
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('Cache status:')) {
      if (message.includes('HIT')) {
        cacheHits.hits++;
      } else if (message.includes('MISS')) {
        cacheHits.misses++;
      }
    }
    originalLog.apply(console, args);
  };

  // Log cache performance every 30 seconds
  setInterval(() => {
    const total = cacheHits.hits + cacheHits.misses;
    if (total > 0) {
      const hitRate = Math.round((cacheHits.hits / total) * 100);
      console.log(`📊 Cache Performance: ${hitRate}% hit rate (${cacheHits.hits} hits, ${cacheHits.misses} misses, ${cacheHits.errors} errors)`);
    }
  }, 30000);

  return cacheHits;
}