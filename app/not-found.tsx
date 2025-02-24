import { getDefaultTemplate, getPostByPath } from "@/lib/wp/posts";
import { getSettings } from "@/lib/wp/settings";
import { BlockParser } from "@/ui/block-parser";
import classNames from "classnames";
import BeforeContent from "./BeforeContent";
import AfterContent from "./AfterContent";
import { Suspense } from "react";
import { GTM } from "./(extras)/gtm";
import { Providers } from "./providers";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function NotFound() {
  const settings = await getSettings();
  const defaultTemplate = await getDefaultTemplate();
  const post = settings.page_404
    ? await getPostByPath(settings.page_404.post_name, true, false)
    : undefined;

  return (
    <Providers>
      <Suspense fallback={null}>
        <body className="no-transition">
          {settings.google_tag_manager_enabled === true && (
            <Suspense>
              <noscript>
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${settings.google_tag_manager_id}`}
                  height="0"
                  width="0"
                  style={{ display: "none", visibility: "hidden" }}
                />
              </noscript>
              <GTM GTM_ID={settings.google_tag_manager_id} />
            </Suspense>
          )}
          <BeforeContent defaultTemplate={defaultTemplate} />
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
          <AfterContent defaultTemplate={defaultTemplate} />
        </body>
      </Suspense>
    </Providers>
  );
}

export async function generateMetadata(props: PageProps) {
  const settings = await getSettings();
  if (!settings.page_404) return null;
  const page404 = await getPostByPath(settings.page_404.post_name);
  return page404.yoastHeadJSON;
}
