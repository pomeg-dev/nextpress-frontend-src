import { notFound } from 'next/navigation';
import { BlockParser } from "@/ui/block-parser";
import { NPAdminBar } from "../(extras)/npadminbar";
import { getPosts, getPostByPath, getTaxTerm } from "@/lib/wp/posts";
import { PostWithContent } from "@/lib/types";
import { getSettings } from "@/lib/wp/settings";
import { decode } from "html-entities";
import { redirect } from "next/navigation";
import { Metadata } from 'next';
import { getFrontEndUrl } from '@/utils/url';
import CategoryArchive from '@/ui/category-archive';
import { additionalPostData, parseTemplateBlocks } from '@/lib/utils';

export const dynamic = "force-dynamic";

type NextProps = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Post({ params, searchParams }: NextProps) {
  const { slug } = await params;

  // Dont run for favicon, api, status requests
  if (slug && slug[0] === "favicon.ico") return null;
  if (slug && slug[0] === "api") return null;
  if (slug && slug[0] === "status") return null;

  // Get settings.
  const settings = await getSettings();

  // Handle category pages.
  if (
    slug && 
    settings?.page_for_posts_slug && 
    slug[0] === settings.page_for_posts_slug &&
    slug[1] && slug[2]
  ) {
    const taxonomy = slug[1];
    const term = slug[2];
    return (
      <CategoryArchive taxonomy={taxonomy} term={term} />
    );
  }

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

  // Set up schema.
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

  // Wrap acf_data into before/after/sidebar content.
  let beforeContent = parseTemplateBlocks(
    post?.template?.before_content && post?.template?.before_content.length > 0 
      ? post.template.before_content
      : [],
    settings?.before_content || [],
    post,
    true
  );

  let afterContent = parseTemplateBlocks(
    post?.template?.after_content && post?.template?.after_content.length > 0 
      ? post.template.after_content
      : [],
    settings?.after_content || [],
    post,
  );

  const disableSidebar = post?.acf_data?.disable_sidebar || false;
  let sidebarContent = null;
  if (post?.template?.sidebar_content && !disableSidebar) {
    sidebarContent = additionalPostData(post.template.sidebar_content, post);
  }

  return (
    <>
      {updatedSchema &&
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(updatedSchema) }}
        />
      }
      {settings?.enable_user_flow &&
        <NPAdminBar postID={post.id} />
      }
      {beforeContent &&
        <BlockParser blocks={beforeContent} />
      }
      {sidebarContent ? (
        <section className="content-sidebar container">
          <main data-cpt={post?.type?.id || "page"} data-pageurl={post?.slug?.slug || "/"} data-postid={post?.id || 0}>
            {post.content && <BlockParser blocks={post.content} />}
          </main>
          <aside className="sidebar"><BlockParser blocks={sidebarContent} /></aside>
        </section>
      ) : (
        <main className="no-sidebar" data-cpt={post?.type?.id || "page"} data-pageurl={post?.slug?.slug || "/"} data-postid={post?.id || 0}>
          {post.content && <BlockParser blocks={post.content} />}
        </main>
      )}
      {afterContent &&
        <BlockParser blocks={afterContent} />
      }
    </>
  );
}

export async function generateStaticParams() {
  const allPosts = await getPosts({ 
    per_page: -1,
    include_metadata: false,
    slug_only: true,
  });

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
  if (
    slug && 
    settings?.page_for_posts_slug && 
    slug[0] === settings.page_for_posts_slug &&
    slug[1] && slug[2]
  ) {
    post = await getTaxTerm(slug[1], slug[2]);
  }

  if (!post) return notFound;

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
      post.yoastHeadJSON.canonical = canonical;
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
  } else return notFound;
}
