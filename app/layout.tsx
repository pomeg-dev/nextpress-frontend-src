import Animations from "./(extras)/animations";
import BeforeContent from "./BeforeContent";
import AfterContent from "./AfterContent";
import { cookies } from "next/headers";
import "../ui/globals.scss";
import { getDefaultTemplate } from "@/lib/wp/posts";
import { getBlockTheme } from "@/lib/wp/theme";
import { fontVariables } from "@themes/fonts/font-loader";
import { Suspense } from "react";
import { GTM } from "./(extras)/gtm";
import { getSettings } from "@/lib/wp/settings";
import { VWO } from "./(extras)/vwo";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultTemplate = await getDefaultTemplate();
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
      <head>
        {(settings.vwo_enabled === true && settings.vwo_account_id) && (
          <Suspense>
            <VWO accountId={settings.vwo_account_id} />
          </Suspense>
        )}
      </head>
      {/* <body className="no-transition"> */}
      <body className="no-transition">
        {settings.google_tag_manager_enabled === true && (
          <Suspense>
            <GTM GTM_ID={settings.google_tag_manager_id} />
          </Suspense>
        )}
        <BeforeContent defaultTemplate={defaultTemplate} />
        {children}
        <AfterContent defaultTemplate={defaultTemplate} />
      </body>
      <Animations />
    </html>
  );
}
