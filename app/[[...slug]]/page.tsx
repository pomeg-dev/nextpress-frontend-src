import { BlockParser } from "@/ui/block-parser";
import { NPAdminBar } from "../(extras)/npadminbar";
import { getPosts, getPostByPath, getDefaultTemplate } from "@/lib/wp/posts";
import { PostWithContent } from "@/lib/types";
import { Styles } from "../(extras)/styles";
import { getSettings } from "@/lib/wp/settings";
import { decode } from "html-entities";
import { GatedPost } from "../(extras)/gated-post";
import { notFound } from "next/navigation";
import AfterContent from "../AfterContent";
import BeforeContent from "../BeforeContent";
import { Suspense } from "react";
import { GTM } from "../(extras)/gtm";
import classNames from "classnames";
import { SidebarMenu } from "@themes/components/organisms/SidebarMenu";

// Should be force-static - but this breaks cookies/session.
export const dynamic = "force-dynamic"; //unsure what this fixed but it was something

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

  if (post['404'] && post['404'] === true) {
    notFound();
  }

  const settings = await getSettings();
  const defaultTemplate = await getDefaultTemplate();

  return (
    <>
      <head></head>
      {/* <body className="no-transition"> */}
      <body className="no-transition">
        {settings.google_tag_manager_enabled === true && (
          <Suspense>
            <GTM GTM_ID={settings.google_tag_manager_id} />
          </Suspense>
        )}
        {settings.enable_login_redirect && <GatedPost settings={settings} path={path} />}
        <BeforeContent defaultTemplate={defaultTemplate} />
        <NPAdminBar postID={post.id} />
        <Styles settings={settings} />
        {post?.acf_data?.sidebar_menu &&
          <SidebarMenu menuItems={post?.acf_data?.sidebar_menu} path={path} />
        }
        <main
          className={classNames(
            post?.acf_data?.sidebar_menu && "w-[calc(100%-300px)] min-h-[calc(100vh-73px)] ml-[300px] bg-[rgb(245,248,249)]"
          )}
          data-pageurl={post.slug.slug}
          data-postid={post.id}
        >
          {post.content && <BlockParser blocks={post.content} />}
        </main>
        <AfterContent defaultTemplate={defaultTemplate} />
      </body>
    </>
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