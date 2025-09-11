import { getSettings } from "@/lib/wp/settings";
import "../ui/globals.scss";
import { getBlockTheme } from "@/lib/wp/theme";
import { Suspense } from "react";
import { LocaleProvider } from "./providers";
import { fontVariables } from "ui/fonts/font-loader";
import { CookieManager } from "@ui/components/organisms/default/CookieManager";
import { initializeComponentCache } from "@/lib/cache-warmer";
import { figmaVariablesCSS } from "@/lib/figma-variables.css";

// Function to dynamically load theme-specific Figma variables
async function getThemeFigmaVariables(theme: string): Promise<string> {
  try {
    // Try to import theme vars
    const themeModule = await import(`@/lib/figma-variables-${theme}.css`);
    const variableName = `figmaVariables${theme.charAt(0).toUpperCase() + theme.slice(1)}CSS`;
    return themeModule[variableName] || figmaVariablesCSS;
  } catch (error) {
    // Fall back to default variables if file doesn't exist
    console.warn(`Theme-specific Figma variables not found for theme: ${theme}, falling back to default`);
    return figmaVariablesCSS;
  }
}

// Create separate components for async operations
async function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themes = await getBlockTheme();
  
  // Initialize component cache in background
  initializeComponentCache().catch(console.warn);
  
  // Get theme-specific Figma variables
  const mainTheme = themes[0] || 'sommet';
  const themeFigmaVariables = await getThemeFigmaVariables(mainTheme);
  
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
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeFigmaVariables }} />
      </head>
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
      {children}
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
