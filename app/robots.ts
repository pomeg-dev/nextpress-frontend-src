import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const isProduction = process.env.VERCEL_ENV === "production";
  
  return {
    rules: isProduction ? [
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
    ] : [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    sitemap: [
      `/sitemap.xml`,
      `/post-sitemap.xml`,
      `/page-sitemap.xml`,
      `/program-sitemap.xml`,
    ],
  };
}