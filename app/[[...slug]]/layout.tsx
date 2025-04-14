import { getSettings } from "@/lib/wp/settings";
import { getPostByPath, getPosts } from "@/lib/wp/posts";
import { Block, Post, PostWithContent } from "@/lib/types";
import { BlockParser } from "@/ui/block-parser";

const additionalPostData = (blocks: Block[], post: Post) => {
  if (blocks && blocks.length > 0) {
    blocks.map((block: Block) => {
      block.data.current_post = {...post};
    });
  }
  return blocks;
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const settings = await getSettings();

  const path = slug ? slug.join("/") : "";
  let post;
  if (slug && slug[0] === "draft") {
    post = await getPostByPath(slug[1], true, true);
  } else {
    post = await getPostByPath(path);
  }

  // Wrap acf_data into before/after/sidebar content.
  let beforeContent = null;
  if (post?.template?.before_content && post?.template?.before_content.length > 0) {
    beforeContent = additionalPostData(post.template.before_content, post);
  } else if (settings?.before_content) {
    beforeContent = additionalPostData(settings.before_content, post);
  }

  let afterContent = null;
  if (post?.template?.after_content && post?.template?.after_content.length > 0) {
    afterContent = additionalPostData(post.template.after_content, post);
  } else if (settings?.after_content) {
    afterContent = additionalPostData(settings.after_content, post);
  }

  let sidebarContent = null;
  if (post?.template?.sidebar_content) {
    sidebarContent = additionalPostData(post.template.sidebar_content, post);
  }

  return (
    <>
      {beforeContent &&
        <BlockParser blocks={beforeContent} />
      }
      {sidebarContent ? (
        <div data-cpt={post.type.id} className="content-sidebar container flex">
          {children}
          <aside><BlockParser blocks={sidebarContent} /></aside>
        </div>
      ) : (
        <>{children}</>
      )}
      {afterContent &&
        <BlockParser blocks={afterContent} />
      }
    </>
  );
}

export async function generateStaticParams() {
  const allPosts = await getPosts({ per_page: -1 });
  return allPosts.map((post: PostWithContent) => ({
    params: { slug: post.slug.full_path },
  }));
}