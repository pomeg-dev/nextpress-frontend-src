import { getPostByPath } from "@/lib/wp/posts";
import { getSettings } from "@/lib/wp/settings";
import { BlockParser } from "@/ui/block-parser";
import classNames from "classnames";

export default async function NotFound() {
  const settings = await getSettings([
    'page_404',
    'before_content',
    'btn_transition',
    'after_content'
  ]);
  const post = settings.page_404
    ? await getPostByPath(settings.page_404.post_name, true, false)
    : undefined;

  return (
    <>
      {settings?.before_content && (
        <BlockParser blocks={settings.before_content} />
      )}
      {settings.posts_404 && post ? (
        <main data-pageurl={post.path} data-postid={post.id}>
          {post.content && <BlockParser blocks={post.content} />}
        </main>
      ) : (
        <div className="page-404 flex min-h-screen flex-col justify-between">
          <div
            className={classNames(
              "overflow-hidden bg-white",
              "button-effect-" + settings.btn_transition
            )}
          >
            <div className="py-[100px] text-center">
              <h1 className="text-[50px] font-bold">404</h1>
              <p className="text-[20px]">Page not found</p>
            </div>
          </div>
        </div>
      )}
      {settings?.after_content && (
        <BlockParser blocks={settings.after_content} />
      )}
    </>
  );
}

export async function generateMetadata() {
  const notFound = {
    title: "Not found",
    description: "Not found",
  };
  const settings = await getSettings([
    'page_404'
  ]);
  if (!settings.page_404) return notFound;
  const page404 = await getPostByPath(settings.page_404.post_name);
  return page404.yoastHeadJSON;
}
