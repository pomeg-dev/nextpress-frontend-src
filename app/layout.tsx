import Animations from "./(extras)/animations";
import "../ui/globals.scss";
import { getBlockTheme } from "@/lib/wp/theme";
import { fontVariables } from "@themes/fonts/font-loader";
import { getSettings } from "@/lib/wp/settings";
import { GTM } from "./(extras)/gtm";
import { VideoAsk } from "./(extras)/video-ask";

export default async function Layout({
  children,
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
      {children}
      <Animations />
      {settings.google_tag_manager_enabled === true && (
        <GTM GTM_ID={settings.google_tag_manager_id} />
      )}
      {settings.videoask_enabled === true && settings.videoask_url && (
        <VideoAsk videoask_url={settings.videoask_url} />
      )}
    </html>
  );
}
