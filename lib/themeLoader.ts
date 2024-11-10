// lib/theme-loader.ts
import fs from "fs";
import path from "path";
import { cache } from "react";

// Cache the theme loading to avoid unnecessary file system operations
export const loadThemeStyles = cache(async () => {
  const themesDir = path.join(process.cwd(), "themes");

  try {
    // Get all directory names in the themes folder
    const themeDirectories = fs
      .readdirSync(themesDir)
      .filter((file) => fs.statSync(path.join(themesDir, file)).isDirectory());

    // Import all theme.scss files
    const themeImports = themeDirectories
      .map((theme) => {
        const themePath = path.join(themesDir, theme, "theme.scss");
        if (fs.existsSync(themePath)) {
          return import(`../../themes/${theme}/theme.scss`);
        }
        return null;
      })
      .filter(Boolean);

    return themeImports;
  } catch (error) {
    console.error("Error loading theme styles:", error);
    return [];
  }
});

// Utility function to generate CSS variables from theme colors
export const generateThemeVariables = (themes: string[]) => {
  return themes.reduce(
    (acc: { [key: string]: string }, theme: string, index: number) => {
      if (index === 0) {
        acc["data-theme"] = theme;
      } else {
        const themeTypes = ["primary", "secondary", "tertiary", "quaternary"];
        const themeType = themeTypes[index - 1] || `custom-${index}`;
        acc[`data-theme-${themeType}`] = theme;
      }
      return acc;
    },
    {}
  );
};
