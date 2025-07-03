import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: "Screaming Frog SEO Spider",
        allow: "/",
      },
      {
        // userAgent: "*",
        // allow: "/",
        // disallow: "/private/",
        userAgent: "*",
        disallow: "/"
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
    sitemap: `/sitemap.xml`,
  };
}