import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
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