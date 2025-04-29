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
        <section data-cpt={post.type.id} className="content-sidebar container">
          {children}
          <aside><BlockParser blocks={sidebarContent} /></aside>
        </section>
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
  if (process.env.NODE_ENV === 'development') {
    const allPages = await getPosts({ 
      per_page: 50,   
      post_type: 'page'
    });

    const customPosts = await getPosts({ 
      per_page: 50,   
      post_type: 'any',
      post_type__not_in: ['post', 'page'],
    });

    const recentPosts = await getPosts({ 
      per_page: 10, 
      post_type: 'post',
      orderby: 'date', 
      order: 'desc' 
    });

    const combinedParams = [
      ...allPages.map((post: PostWithContent) => ({
        params: { slug: post.slug.full_path },
      })),
      ...customPosts.map((post: PostWithContent) => ({
        params: { slug: post.slug.full_path },
      })),
      ...recentPosts.map((post: PostWithContent) => ({
        params: { slug: post.slug.full_path },
      }))
    ];

    return combinedParams;
  }

  const postsPerBatch = 100;
  let page = 1;
  let allParams: { params: { slug: string[] } }[] = [];
  let hasMorePosts = true;
  
  while (hasMorePosts) {
    const posts = await getPosts({ per_page: postsPerBatch, page });
    
    if (posts.length === 0) {
      hasMorePosts = false;
    } else {
      const newParams = posts.map((post: PostWithContent) => ({
        params: { slug: post.slug.full_path },
      }));
      
      allParams = [...allParams, ...newParams];
      page++;
    }
  }
  
  return allParams;
}