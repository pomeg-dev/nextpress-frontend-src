import { getSettings } from "@/lib/wp/settings";
import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  const settings = await getSettings();
  const siteImage = settings.og_default_image;

  if (siteImage) {
    return new ImageResponse(
      (
        <img
          alt="avatar"
          src={siteImage}
          width={size.width}
          height={size.height}
        ></img>
      ),
      size
    );
  }
  //   Font
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: settings.primary_color ? settings.primary_color : "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: settings.secondary_color ? settings.secondary_color : "#000",
        }}
      >
        {settings.blogname ? settings.blogname : "Site Preview"}
      </div>
    ),
    {
      ...size,
    }
  );
}
