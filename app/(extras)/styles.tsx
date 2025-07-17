type PageStyle = "Red" | "Blue";

export function Styles({ settings, pageStyle = "Red" }: { settings: any; pageStyle?: PageStyle }) {
  const styles: Record<PageStyle, { primary: any; secondary: any; tertiary: any; quaternary: any }> = {
    Red: {
      primary: settings.primary_color,
      secondary: settings.secondary_color,
      tertiary: settings.tertiary_color,
      quaternary: settings.quaternary_color,
    },
    Blue: {
      primary: "#738DFA",
      secondary: settings.secondary_color,
      tertiary: settings.tertiary_color,
      quaternary: "rgba(44, 134, 198, 0.73)",
    }
  };

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
      <style>
        :root {
          --color-primary: ${styles?.[pageStyle]?.primary};
          --color-secondary: ${styles?.[pageStyle]?.secondary};
          --color-tertiary: ${styles?.[pageStyle]?.tertiary};
          --color-quaternary: ${styles?.[pageStyle]?.quaternary};
        }
        </style>`,
      }}
    />
  );
}
