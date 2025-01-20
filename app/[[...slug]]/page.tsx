import { BlockParser } from "@/ui/block-parser";
import { NPAdminBar } from "../(extras)/npadminbar";
import { getPosts, getPostByPath } from "@/lib/wp/posts";
import { PostWithContent } from "@/lib/types";
import { Styles } from "../(extras)/styles";
import { getSettings } from "@/lib/wp/settings";
import { decode } from "html-entities";
import { GatedPost } from "../(extras)/gated-post";

// Force static render of all pages. This breaks cookies, but gated content uses client side sessions to render post content/login page.
export const dynamic = "force-static";

type NextProps = {
  params: {
    slug: string[];
  };
  searchParams: {
    preview: string;
    _thumbnail_id: string;
  };
};

export default async function Post(props: NextProps) {
  const { slug } = props.params;

  //dont run for favicon, api, status requests
  if (slug && slug[0] === "favicon.ico") return null;
  if (slug && slug[0] === "api") return null;
  if (slug && slug[0] === "status") return null;

  const path = slug ? slug.join("/") : "";
  let post;
  if (slug && slug[0] === "draft") {
    post = await getPostByPath(slug[1], true, true);
  } else {
    post = await getPostByPath(path);
  }
  const settings = await getSettings();

  return (
    <GatedPost settings={settings} post={post}>
      <NPAdminBar postID={post.id} />
      <Styles settings={settings} />
      <main data-pageurl={post.slug.slug} data-postid={post.id}>
        {post.content && <BlockParser blocks={post.content} />}
      </main>
    </GatedPost>
  );
}

export async function generateStaticParams() {
  const allPosts = await getPosts({ per_page: -1 });
  return allPosts.map((post: PostWithContent) => ({
    params: { slug: post.slug.full_path },
  }));
}

export async function generateMetadata(props: NextProps) {
  const { slug } = props.params;

  //dont run for favicon, api, status requests
  if (slug && slug[0] === "favicon.ico") return null;
  if (slug && slug[0] === "api") return null;
  if (slug && slug[0] === "status") return null;
  if (slug && slug[0] === "draft") return null;

  const path = slug ? slug.join("/") : "";
  const post = await getPostByPath(path);
  const settings = await getSettings();

  let frontendDomainURL = "http://localhost:3000";
  if (settings.blocks_api_url) {
    frontendDomainURL = settings.blocks_api_url.replace("/api/blocks", "");
  }

  if (!post) return null;

  if (post.yoastHeadJSON) {
    post.yoastHeadJSON.title = decode(post.yoastHeadJSON.title); //fix ampersands etc in title
    post.yoastHeadJSON.metadataBase = new URL(`${frontendDomainURL}`);
    if (!path || path == "")
      post.yoastHeadJSON.alternates = { canonical: `${frontendDomainURL}` };
    else
      post.yoastHeadJSON.alternates = {
        canonical: `${frontendDomainURL}/${path}`,
      };
    return post.yoastHeadJSON;
  } else return null;
}