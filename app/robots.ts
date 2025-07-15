import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "FirecrawlAgent",
        allow: "/",
      },
      {
        userAgent: "AndiBot",
        allow: "/",
      },
      {
        userAgent: "ExaBot",
        allow: "/",
      },
      {
        userAgent: "PhindBot",
        allow: "/",
      },
      {
        userAgent: "YouBot",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: "/private/",
      },
      {
        userAgent: "*",
        disallow: "/*?_rsc=*",
      },
      {
        userAgent: "*",
        disallow: "/*&_rsc=*",
      },
      {
        userAgent: "*",
        disallow: "/magazine/module",
      },
      {
        userAgent: "*",
        disallow: "/themes",
      },
    ],
    sitemap: [
      `/sitemap.xml`,
      `/post-sitemap.xml`,
      `/page-sitemap.xml`,
    ],
  };
}