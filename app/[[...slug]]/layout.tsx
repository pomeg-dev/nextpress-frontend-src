import { getSettings } from "@/lib/wp/settings";
import { getPostByPath, getPosts } from "@/lib/wp/posts";
import { Block, Post, PostWithContent } from "@/lib/types";
import { BlockParser } from "@/ui/block-parser";

const parseTemplateBlocks = (
  postBlocks: Block[] = [], 
  settingsBlocks: Block[] = [], 
  post: Post,
  before: boolean = false,
) => {
  const headerFooterMap = new Map();
  postBlocks.forEach((block) => {
    if (block.blockName && 
        (block.blockName.toLowerCase().includes('header') || 
         block.blockName.toLowerCase().includes('footer'))) {
      headerFooterMap.set(block.blockName, block);
    }
  });
  
  const filteredSettingsBlocks = settingsBlocks.filter((block) => {
    if (!block.blockName) return true;
    
    return !headerFooterMap.has(block.blockName);
  });
  
  let blocks = before ? 
    [...filteredSettingsBlocks, ...postBlocks] : 
    [...postBlocks, ...filteredSettingsBlocks];
  
  blocks = additionalPostData(blocks, post);
  return blocks;
};

const additionalPostData = (blocks: Block[], post: Post) => {
  if (blocks && blocks.length > 0) {
    blocks.map((block: Block) => {
      if (!block.data) {
        block.data = {};
      }
      if (!block.data.current_post) {
        block.data.current_post = {...post};
      }
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
      {beforeContent &&
        <BlockParser blocks={beforeContent} />
      }
      {sidebarContent ? (
        <section className="content-sidebar container">
          <main data-cpt={post.type.id} data-pageurl={post.slug.slug} data-postid={post.id}>
            {children}
          </main>
          <aside className="sidebar"><BlockParser blocks={sidebarContent} /></aside>
        </section>
      ) : (
        <main className="no-sidebar" data-cpt={post.type.id} data-pageurl={post.slug.slug} data-postid={post.id}>
          <>{children}</>
        </main>
      )}
      {afterContent &&
        <BlockParser blocks={afterContent} />
      }
    </>
  );
}