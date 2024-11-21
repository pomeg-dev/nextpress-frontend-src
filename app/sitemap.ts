import { MetadataRoute } from "next";
import moment from "moment";
import { getPosts } from "@/lib/wp/posts";
import { getSettings } from "@/lib/wp/settings";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await getPosts({ per_page: -1 });
  const settings = await getSettings();

  let frontendDomainURL = "http://localhost:3000";
  if (settings.blocks_api_url) {
    frontendDomainURL = settings.blocks_api_url.replace('/api/blocks', '');
  }

  const pageRoutes: any[] = [];
  const postRoutes: any[] = [];
  const otherRoutes: any[] = [];

  allPosts.map((post: any) => {
    const postType = post.type.id ?? "page";
    let url = `${frontendDomainURL}${post.path}`;
    let priority = 0.5;

    if (postType === "page") {
      if (post.is_homepage || post.slug.slug === "home") {
        priority = 1;
      } else {
        priority = 0.8;
      }
    }

    //dont add to sitemap if noindex
    if (post.yoastHeadJSON && post.yoastHeadJSON.robots.index !== "index")
      return;

    const route = {
      url: url,
      lastModified: moment(post.date, "YYYY-MM-DD HH:mm:ss").format(
        "YYYY-MM-DD"
      ),
      priority: priority,
      changeFrequency: postType === "page" ? "monthly" : "yearly",
    };

    if (postType === "page") {
      if (post.is_homepage || post.slug.slug === "home") {
        pageRoutes.unshift(route); // Put the homepage at the top of the pages
      } else {
        pageRoutes.push(route);
      }
    } else if (postType === "post") {
      postRoutes.push(route);
    } else {
      otherRoutes.push(route);
    }
  });

  // Concatenate the arrays in the desired order: pages, posts, others
  const routes = [...pageRoutes, ...postRoutes, ...otherRoutes];

  return routes;
}
