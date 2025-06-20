import { getSettings } from "@/lib/wp/settings";
import "../ui/globals.scss";
import { getBlockTheme } from "@/lib/wp/theme";
import { Suspense } from "react";
import { GTM } from "./(extras)/gtm";
import { LocaleProvider, Providers } from "./providers";
import { AuthCheck } from "./AuthCheck";
import { fontVariables } from "ui/fonts/font-loader";
import { VWOScript } from 'vwo-smartcode-nextjs';
import { CookieManager } from "@ui/components/organisms/default/CookieManager";

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
        <LocaleProvider defaultLocale="en">
          {settings.enable_user_flow ? (
            <Providers>
              <Suspense fallback={null}>
                  <AuthCheck />
                {children}
              </Suspense>
            </Providers>
          ) : (
            children
          )}

          {/* <Suspense>
            <CookieManager 
              settings={{
                google_tag_manager_enabled: settings.google_tag_manager_enabled,
                google_tag_manager_id: settings.google_tag_manager_id,
                enable_vwo: settings.enable_vwo,
                vwo_id: settings.vwo_id
              }}
            />
          </Suspense> */}
        </LocaleProvider>
      </body>
    </html>
  );
}
