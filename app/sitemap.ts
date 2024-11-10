import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://acme.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://acme.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://acme.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}

// import { getAllPostsArray, getSettings } from "lib/api";
// import moment from "moment";
// import { MetadataRoute } from "next";

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const allPosts = await getAllPostsArray();
//   const settings = await getSettings("sitemap");

//   const frontendDomainURL =
//     settings.webhook_site_url || "http://localhost:3000";
//   const pageRoutes: any[] = [];
//   const postRoutes: any[] = [];
//   const otherRoutes: any[] = [];

//   Object.keys(allPosts).forEach((postType) => {
//     allPosts[postType].forEach((post: any) => {
//       let url = `${frontendDomainURL}${
//         postType === "page" ? "" : "/" + postType
//       }/${post.post_name}`;
//       let priority = 0.5;

//       if (postType === "page") {
//         if (post.post_name === "home") {
//           url = `${frontendDomainURL}`;
//           priority = 1;
//         } else {
//           url = `${frontendDomainURL}/${post.post_name}`;
//           priority = 0.8;
//         }
//       }
//       const route = {
//         url: url,
//         lastModified: moment(post.post_date, "YYYY-MM-DD HH:mm:ss").format(
//           "YYYY-MM-DD"
//         ),
//         priority: priority,
//         changeFrequency: postType === "page" ? "monthly" : "yearly",
//       };

//       if (postType === "page") {
//         if (post.post_name === "home") {
//           pageRoutes.unshift(route); // Put the homepage at the top of the pages
//         } else {
//           pageRoutes.push(route);
//         }
//       } else if (postType === "post") {
//         postRoutes.push(route);
//       } else {
//         otherRoutes.push(route);
//       }
//     });
//   });

//   // Concatenate the arrays in the desired order: pages, posts, others
//   const routes = [...pageRoutes, ...postRoutes, ...otherRoutes];

//   return routes;
// }
