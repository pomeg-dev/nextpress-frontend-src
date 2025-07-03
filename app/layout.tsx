import { getSettings } from "@/lib/wp/settings";
import "../ui/globals.scss";
import { getBlockTheme } from "@/lib/wp/theme";
import { Suspense } from "react";
import { LocaleProvider, Providers } from "./providers";
import { AuthCheck } from "./AuthCheck";
import { fontVariables } from "ui/fonts/font-loader";
import { CookieManager } from "@ui/components/organisms/default/CookieManager";
import { initializeComponentCache } from "@/lib/cache-warmer";
import Loader from "@ui/components/atoms/Loader";

// Create separate components for async operations
async function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themes = await getBlockTheme();
  
  // Initialize component cache in background (non-blocking)
  initializeComponentCache().catch(console.warn);
  
  const themeProps = themes.reduce(
    (acc: { [key: string]: string }, theme: string, index: number) => {
      if (index === 0) acc["data-theme"] = theme;
      else acc[`data-theme-${index}`] = theme;
      return acc;
    },
    {}
  );

  return (
    <html {...themeProps} className={fontVariables}>
      {children}
    </html>
  );
}

async function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = await getSettings(
    [
      'enable_user_flow', 
      'google_tag_manager_enabled', 
      'google_tag_manager_id',
      'enable_vwo',
      'vwo_id'
    ]
  );
  
  return (
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

      <Suspense>
        <CookieManager 
          settings={{
            google_tag_manager_enabled: settings.google_tag_manager_enabled,
            google_tag_manager_id: settings.google_tag_manager_id,
            enable_vwo: settings.enable_vwo,
            vwo_id: settings.vwo_id
          }}
        />
      </Suspense>
    </LocaleProvider>
  );
}

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </ThemeProvider>
  );
}
