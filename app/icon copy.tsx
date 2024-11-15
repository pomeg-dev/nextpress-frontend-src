import { getSettings } from "@/lib/api";
import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default async function Icon({ params }: any) {
  const settings = await getSettings();
  const faviconUrl = settings.favicon?.url;
  if (faviconUrl) {
    return new ImageResponse(
      <img alt="avatar" src={faviconUrl} width="32px" height="32px"></img>,
      size
    );
  }
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: settings.primary_color ? settings.primary_color : "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: settings.border_radius_medium + "px",
          color: settings.secondary_color ? settings.secondary_color : "#fff",
        }}
      >
        {settings.blogname ? settings.blogname.at(0) : "M"}
      </div>
    ),
    size
  );
}
