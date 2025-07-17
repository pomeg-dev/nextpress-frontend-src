import { notFound } from "next/navigation";
import { BlockParser } from "@/ui/block-parser";
import { NPAdminBar } from "../(extras)/npadminbar";
import { getPostByPath, getDefaultTemplate, getPosts } from "@/lib/wp/posts";
import { Styles } from "../(extras)/styles";
import { getSettings } from "@/lib/wp/settings";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VWO } from "../(extras)/vwo";
import BeforeContent from "../BeforeContent";
import AfterContent from "../AfterContent";
import { GatedPost } from "../(extras)/gated-post";
import classNames from "classnames";
import { PostWithContent } from "@/lib/types";
import { decode } from "html-entities";

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

  if (post["404"] && post["404"] === true) {
    notFound();
  }

  const settings = await getSettings();
  const defaultTemplate = await getDefaultTemplate();
  const metadata = await generateMetadata(props);

  if (post?.acf_data?.theme) {
    defaultTemplate.before_content.forEach((item: any) => {
      if (item && typeof item === 'object') {
        item.style = post.acf_data.theme;
      }
    });
    defaultTemplate.after_content.forEach((item: any) => {
      if (item && typeof item === 'object') {
        item.style = post.acf_data.theme;
      }
    });
  }

  return (
    <>
      <head>
        {metadata &&
          metadata.hreflang &&
          metadata.hreflang.length > 0 &&
          metadata.hreflang.map((locale: { code: string; href: string }) => (
            <link
              key={locale.code}
              rel="alternate"
              hrefLang={locale.code}
              href={locale.href}
            />
          ))}
        {metadata && metadata.schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(metadata.schema),
            }}
          />
        )}
        {settings.vwo_enabled === true && settings.vwo_account_id && (
          <Suspense>
            <VWO accountId={settings.vwo_account_id} />
          </Suspense>
        )}
      </head>
      {/* <body className="no-transition"> */}
      <body className="no-transition">
        {settings.enable_login_redirect && (
          <GatedPost settings={settings} path={path} />
        )}
        <BeforeContent defaultTemplate={defaultTemplate} />
        <NPAdminBar postID={post.id} />
        <Styles settings={settings} pageStyle={post?.acf_data?.theme || "Red"} />
        <main data-pageurl={post.slug.slug} data-postid={post.id} data-style={post?.acf_data?.theme || "Red"}>
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
    if (post.yoastHeadJSON.redirect) {
      redirect(`${frontendDomainURL}/${post.yoastHeadJSON.redirect}`);
    }

    post.yoastHeadJSON.title = decode(post.yoastHeadJSON.title); //fix ampersands etc in title
    post.yoastHeadJSON.metadataBase = new URL(`${frontendDomainURL}`);
    if (post.yoastHeadJSON.canonical) {
      const canonical = post.yoastHeadJSON.canonical.replace(
        process.env.NEXT_PUBLIC_API_URL,
        frontendDomainURL
      );
      post.yoastHeadJSON.alternates = { canonical: canonical };
    } else if (!path || path == "") {
      post.yoastHeadJSON.alternates = { canonical: `${frontendDomainURL}` };
    } else {
      post.yoastHeadJSON.alternates = {
        canonical: `${frontendDomainURL}/${path}`,
      };
    }

    const openGraph = {
      locale: post.yoastHeadJSON.og_locale || null,
      type: post.yoastHeadJSON.og_type || null,
      title: post.yoastHeadJSON.og_title || null,
      url:
        post.yoastHeadJSON.og_url && process.env.NEXT_PUBLIC_API_URL
          ? post.yoastHeadJSON.og_url.replace(
              new RegExp(process.env.NEXT_PUBLIC_API_URL, "g"),
              frontendDomainURL
            )
          : null,
      siteName: post.yoastHeadJSON.og_site_name || null,
      images: post.yoastHeadJSON.og_image
        ? post.yoastHeadJSON.og_image.map(
            (image: {
              url: string;
              width: number;
              height: number;
              type: string;
            }) => ({
              url: image.url,
              width: image.width,
              height: image.height,
              type: image.type,
            })
          )
        : null,
    };

    const twitter = {
      card: post.yoastHeadJSON.twitter_card || null,
      creator: post.yoastHeadJSON.author || null,
      title: post.yoastHeadJSON.og_title || null,
      description: post.yoastHeadJSON.title || null,
      images: post.yoastHeadJSON.og_image
        ? post.yoastHeadJSON.og_image.map((image: { url: any }) => image.url)
        : null,
    };

    let other = {};
    if (post.yoastHeadJSON.twitter_misc) {
      other = {
        "twitter:label1": "Written by",
        "twitter:data1": post.yoastHeadJSON.twitter_misc["Written by"],
        "twitter:label2": "Estimated reading time",
        "twitter:data2":
          post.yoastHeadJSON.twitter_misc["Estimated reading time"],
      };
    }

    const updatedSchema = process.env.NEXT_PUBLIC_API_URL
      ? JSON.parse(
          JSON.stringify(post.yoastHeadJSON.schema).replace(
            new RegExp(process.env.NEXT_PUBLIC_API_URL, "g"),
            frontendDomainURL
          )
        )
      : post.yoastHeadJSON.schema;

    return {
      ...post.yoastHeadJSON,
      openGraph,
      twitter,
      other,
      schema: updatedSchema,
      hreflang: post.hreflang || null,
    };
  } else return null;
}
