// type PageProps = {
//   params: {
//     slug: string;
//   };
// };

// export default async function NotFound() {
//   return <div>notfound</div>;
// }

import {
  getAllPostsArray,
  getPage,
  getSettings,
  getSettingsByPostId,
} from "@/lib/api";
import cn from "classnames";
import { Styles } from "./(extras)/styles";
import { BlockParser } from "@/ui/block-parser";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function NotFound() {
  const allPosts = await getAllPostsArray("not-found");
  const settings = await getSettings("not-found");

  //if coming soon page is enabled and user is not logged in, show the coming soon page
  if (!settings.page_404)
    return (
      <>
        <div className="page-404  min-h-screen flex flex-col justify-between">
          <div
            className={cn(
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
        <Styles settings={settings} />
      </>
    );
  const page404 = await getPage(settings.page_404.ID);
  return (
    <div className="page-404">
      <div
        className={cn(
          "overflow-hidden bg-white",
          "button-effect-" + settings.btn_transition
        )}
      >
        {page404.content && <BlockParser blocks={page404.content} />}
      </div>
      <Styles settings={settings} />
    </div>
  );
}

export async function generateMetadata(props: PageProps) {
  const settings = await getSettings();
  if (!settings.page_404) return null;
  const page404 = await getPage(settings.page_404.ID);
  return page404.yoast_head_json;
}
