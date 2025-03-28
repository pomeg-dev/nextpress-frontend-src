import { getSettings } from "@/lib/wp/settings";
import "../ui/globals.scss";
import { getBlockTheme } from "@/lib/wp/theme";
import { Suspense } from "react";
import { GTM } from "./(extras)/gtm";
import BeforeContent from "./BeforeContent";
import AfterContent from "./AfterContent";
import { Providers } from "./providers";
import { AuthCheck } from "./AuthCheck";
import { fontVariables } from "ui/fonts/font-loader";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const themes = await getBlockTheme();
  const settings = await getSettings();

  // THIS NEEDS CHANGING NT VERY GOOD
  //themes comes back as array
  // for each theme, get 0. theme, 1. secondary, 2. tertiary, 3. quaternary so on and then trun it intomprops on the html tag
  const themeProps = themes.reduce(
    (acc: { [key: string]: string }, theme: string, index: number) => {
      //if index is 0, then it is just theme, otherwise it is theme-primary, theme-secondary, etc
      if (index === 0) acc["data-theme"] = theme;
      else acc[`data-theme-${index}`] = theme;
      return acc;
    },
    {}
  );

  return (
    <html {...themeProps} className={fontVariables}>
      <body>
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
        <Providers>
          <Suspense fallback={null}>
            <AuthCheck />
            <BeforeContent settings={settings} />
            {children}
            <AfterContent settings={settings} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
