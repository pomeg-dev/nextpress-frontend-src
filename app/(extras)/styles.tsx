export function Styles({ settings }: { settings: any }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
      <style>
        :root {
          --color-primary: ${settings.primary_color};
          --color-secondary: ${settings.secondary_color};
          --color-tertiary: ${settings.tertiary_color};
          --color-quaternary: ${settings.quaternary_color};
        }
        </style>`,
      }}
    />
  );
}
