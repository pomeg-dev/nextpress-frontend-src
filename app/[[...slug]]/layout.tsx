import { getSettings } from "@/lib/wp/settings";
import BeforeContent from "../BeforeContent";
import AfterContent from "../AfterContent";
import { getPostByPath, getPosts } from "@/lib/wp/posts";
import { PostWithContent } from "@/lib/types";
import { BlockParser } from "@/ui/block-parser";

const addAcfData = (template: { data: { acf_data: any; }; }[], post: { acf_data: any; }) => {
  if (!post.acf_data) return template;
  if (template && template.length > 0) {
    template.map((block: { data: { acf_data: any; }; }) => {
      block.data.acf_data = {...post.acf_data};
    });
  }
  return template;
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
  if (settings?.after_content) {
    settings.after_content = addAcfData(settings.after_content, post);
  }
  if (settings?.before_content) {
    settings.before_content = addAcfData(settings.before_content, post);
  }
  if (post?.template?.before_content) {
    post.template.before_content = addAcfData(post.template.before_content, post);
  }
  if (post?.template?.after_content) {
    post.template.after_content = addAcfData(post.template.after_content, post);
  }
  if (post?.template?.sidebar_content) {
    post.template.sidebar_content = addAcfData(post.template.sidebar_content, post);
  }

  return (
    <>
      {post?.template?.before_content && post?.template?.before_content?.length > 0 ? (
        <BeforeContent settings={post.template} />
      ) : (
        <BeforeContent settings={settings} />
      )}
      {post?.template?.sidebar_content ? (
        <div className="content-sidebar container flex">
          {children}
          <aside><BlockParser blocks={post.template.sidebar_content} /></aside>
        </div>
      ) : (
        <>{children}</>
      )}
      {post?.template?.after_content && post?.template?.after_content?.length > 0 ? (
        <AfterContent settings={post.template} />
      ) : (
        <AfterContent settings={settings} />
      )}
    </>
  );
}

export async function generateStaticParams() {
  const allPosts = await getPosts({ per_page: -1 });
  return allPosts.map((post: PostWithContent) => ({
    params: { slug: post.slug.full_path },
  }));
}