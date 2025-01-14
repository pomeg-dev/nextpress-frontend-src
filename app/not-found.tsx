import { getPostByPath } from "@/lib/wp/posts";
import { getSettings } from "@/lib/wp/settings";
import { BlockParser } from "@/ui/block-parser";
import classNames from "classnames";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function NotFound() {
  const settings = await getSettings();

  if (!settings.page_404) {
    return (
      <>
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
      </>
    );
  } else {
    const post = await getPostByPath(settings.page_404.post_name, true, true);
    return (
      <main data-pageurl={settings.page_404.post_name} data-postid={settings.page_404.ID}>
        {post.content && <BlockParser blocks={post.content} />}
      </main>
    );
  }
}

// import {
//   getAllPostsArray,
//   getPage,
//   getSettings,
//   getSettingsByPostId,
// } from "lib/api";
// import cn from "classnames";
// import { Styles } from "./(extras)/styles";
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// type PageProps = {
//   params: {
//     slug: string;
//   };
// };

// export default async function NotFound() {
//   const allPosts = await getAllPostsArray("not-found");
//   const settings = await getSettings("not-found");
//   //if coming soon page is enabled and user is not logged in, show the coming soon page
//   if (!settings.page_404)
//     return (
//       <>
//         <div className="page-404 flex min-h-screen flex-col justify-between">
//           {/* @ts-expect-error Server Component */}
//           <Header settings={settings} />
//           <div
//             className={cn(
//               "overflow-hidden bg-white",
//               "button-effect-" + settings.btn_transition
//             )}
//           >
//             <div className="py-[100px] text-center">
//               <h1 className="text-[50px] font-bold">404</h1>
//               <p className="text-[20px]">Page not found</p>
//             </div>
//           </div>
//           {/* @ts-expect-error Server Component */}
//           <Footer settings={settings} />
//         </div>
//         <Styles settings={settings} />
//       </>
//     );
//   const page404 = await getPage(settings.page_404.ID);
//   return (
//     <div className="page-404">
//       {/* @ts-expect-error Server Component */}
//       <Header settings={settings} />
//       <div
//         className={cn(
//           "overflow-hidden bg-white",
//           "button-effect-" + settings.btn_transition
//         )}
//       >
//         <BlockContent
//           settings={settings}
//           blockData={page404.block_data}
//           allPosts={allPosts}
//         />
//       </div>
//       {/* @ts-expect-error Server Component */}
//       <Footer settings={settings} />
//       <Styles settings={settings} />
//     </div>
//   );
// }

// export async function generateMetadata(props: PageProps) {
//   const settings = await getSettings();
//   if (!settings.page_404) return null;
//   const page404 = await getPage(settings.page_404.ID);
//   return page404.yoast_head_json;
// }
