import { getSettings } from "lib/api";
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: `/sitemap.xml`,
  };
}

// import { getSettings } from "lib/api";
// import { MetadataRoute } from "next";

// export default async function robots(): Promise<MetadataRoute.Robots> {
//   const settings = await getSettings("robots");
//   const frontendDomainURL =
//     settings.webhook_site_url || "http://localhost:3000";
//   return {
//     rules: {
//       userAgent: "*",
//       allow: "/",
//       disallow: "/private/",
//     },
//     sitemap: `${frontendDomainURL}/sitemap.xml`,
//   };
// }
