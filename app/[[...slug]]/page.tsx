import { notFound } from 'next/navigation';
import { BlockParser } from "@/ui/block-parser";
import { NPAdminBar } from "../(extras)/npadminbar";
import { getPosts, getPostByPath } from "@/lib/wp/posts";
import { PostWithContent } from "@/lib/types";
import { getSettings } from "@/lib/wp/settings";
import { decode } from "html-entities";
import { redirect } from "next/navigation";
import { Metadata } from 'next';

export const dynamic = "force-dynamic";

const getFrontEndUrl = (settings: any) => {
  let frontendDomainURL = "http://localhost:3000";
  if (settings.blocks_api_url) {
    frontendDomainURL = settings.blocks_api_url.replace("/api/blocks", "");
  }
  return frontendDomainURL;
};

type NextProps = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Post({ params, searchParams }: NextProps) {
  const { slug } = await params;

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

  if (!post || (post?.['404'] && post['404'] === true)) {
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

export async function generateMetadata(
  { params }: NextProps,
): Promise<Metadata> {
  const { slug } = await params;

  const notFound = {
    title: "Not found",
    description: "Not found",
  };

  // Dont run for favicon, api, status, draft requests
  if (slug && slug[0] === "favicon.ico") return notFound;
  if (slug && slug[0] === "api") return notFound;
  if (slug && slug[0] === "status") return notFound;
  if (slug && slug[0] === "draft") return notFound;

  const path = slug ? slug.join("/") : "";
  const settings = await getSettings();
  const frontendDomainURL = getFrontEndUrl(settings);
  let post = await getPostByPath(path, false);

  if (!post) return notFound;

  if (post.yoastHeadJSON) {
    post.yoastHeadJSON.title = decode(post?.yoastHeadJSON?.title);
    post.yoastHeadJSON.metadataBase = new URL(`${frontendDomainURL}`);
    if (post.yoastHeadJSON.canonical) {
      const canonical = post.yoastHeadJSON.canonical.replace(
        process.env.NEXT_PUBLIC_API_URL,
        frontendDomainURL
      );
      post.yoastHeadJSON.canonical = canonical;
      post.yoastHeadJSON.alternates = { canonical: canonical };
    } else if (!path || path == "") {
      post.yoastHeadJSON.alternates = { canonical: `${frontendDomainURL}` };
    } else {
      post.yoastHeadJSON.alternates = {
        canonical: `${frontendDomainURL}/${path}`,
      };
    }

    const languages: {[key: string]: any} = {};
    if (post.hreflang && post.hreflang.length > 0) {
      languages["x-default"] = post.yoastHeadJSON?.canonical || '/';
      post.hreflang.map((locale: { code: string; href: string }) => {
        languages[locale.code] = locale.href;
      });
    }

    return {
      title: post.yoastHeadJSON.title,
      description: post.yoastHeadJSON.description,
      robots: post.yoastHeadJSON.robots,
      metadataBase: post.yoastHeadJSON.metadataBase,
      openGraph: {
        locale: post.yoastHeadJSON.og_locale,
        type: post.yoastHeadJSON.og_type,
        title: post.yoastHeadJSON.og_title,
        description: post.yoastHeadJSON.og_description,
        url: post.yoastHeadJSON.og_url?.replace(
          new RegExp(process.env.NEXT_PUBLIC_API_URL || '', 'g'),
          frontendDomainURL
        ),
        siteName: post.yoastHeadJSON.og_site_name,
        images: post.yoastHeadJSON.og_image?.map((image: any) => ({
          url: image.url,
          width: image.width,
          height: image.height,
          type: image.type,
        })),
        publishedTime: post.yoastHeadJSON.article_published_time,
        modifiedTime: post.yoastHeadJSON.article_modified_time,
      },
      twitter: {
        card: post.yoastHeadJSON.twitter_card,
        creator: post.yoastHeadJSON.author,
        images: post.yoastHeadJSON.og_image?.map((image: any) => image.url),
      },
      alternates: {
        canonical: post?.yoastHeadJSON?.canonical || post?.yoastHeadJSON?.alternates?.canonical || '/',
        languages
      },
    };
  } else return notFound;
}