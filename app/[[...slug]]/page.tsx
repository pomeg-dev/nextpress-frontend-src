import { notFound } from 'next/navigation';
import { BlockParser } from "@/ui/block-parser";
import { NPAdminBar } from "../(extras)/npadminbar";
import { getPosts, getPostByPath } from "@/lib/wp/posts";
import { PostWithContent } from "@/lib/types";
import { getSettings } from "@/lib/wp/settings";
import { decode } from "html-entities";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const getFrontEndUrl = (settings: any) => {
  let frontendDomainURL = "http://localhost:3000";
  if (settings.blocks_api_url) {
    frontendDomainURL = settings.blocks_api_url.replace("/api/blocks", "");
  }
  return frontendDomainURL;
};

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
  let updatedSchema = null;
  if (post?.yoastHeadJSON?.schema) {
    updatedSchema = process.env.NEXT_PUBLIC_API_URL 
      ? JSON.parse(
          JSON.stringify(post.yoastHeadJSON.schema).replace(
            new RegExp(process.env.NEXT_PUBLIC_API_URL, 'g'),
            getFrontEndUrl(settings)
          )
        ) 
      : post.yoastHeadJSON.schema;
  }

  return (
    <>
      {updatedSchema &&
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(updatedSchema) }}
        />
      }
      <NPAdminBar postID={post.id} />
      <main data-pageurl={post.slug.slug} data-postid={post.id}>
        {post.content && <BlockParser blocks={post.content} />}
      </main>
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
  const frontendDomainURL = getFrontEndUrl(settings);

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
      url: post.yoastHeadJSON.og_url && process.env.NEXT_PUBLIC_API_URL ? 
        post.yoastHeadJSON.og_url.replace(
          new RegExp(process.env.NEXT_PUBLIC_API_URL, 'g'),
          frontendDomainURL
        ) : 
        null,
      siteName: post.yoastHeadJSON.og_site_name || null,
      images: post.yoastHeadJSON.og_image ?
        post.yoastHeadJSON.og_image.map((image: { url: string; width: number; height: number; type: string; }) => 
          ({
            url: image.url,
            width: image.width,
            height: image.height,
            type: image.type,
          })
        ) : null,
    };

    const twitter: {[key: string]: any} = {
      card: post.yoastHeadJSON.twitter_card || null,
      creator: post.yoastHeadJSON.author || null,
      title: post.yoastHeadJSON.og_title || null,
      description: post.yoastHeadJSON.title || null,
      images: post.yoastHeadJSON.og_image 
        ? post.yoastHeadJSON.og_image.map((image: { url: any; }) => image.url) 
        : null,
      label1: 'Written by',
      data1: post.yoastHeadJSON.twitter_misc?.['Written by'] || "Unknown",
      label2: 'Estimated reading time',
      data2: post.yoastHeadJSON.twitter_misc?.['Estimated reading time'] || "N/A",
    };

    const languages: {[key: string]: any} = {};
    if (post.hreflang && post.hreflang.length > 0) {
      languages["x-default"] = post.yoastHeadJSON?.canonical || '/';
      post.hreflang.map((locale: { code: string; href: string }) => {
        languages[locale.code] = locale.href;
      });
    }

    return {
      ...post.yoastHeadJSON,
      ...openGraph,
      ...twitter,
      alternates: {
        canonical: post.yoastHeadJSON?.canonical || '/',
        languages
      },
    };
  } else return null;
}
