import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      // userAgent: "*",
      // allow: "/",
      // disallow: "/private/",
      userAgent: "*",
      disallow: "/"
    },
    sitemap: `/sitemap.xml`,
  };
}