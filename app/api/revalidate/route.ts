import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const allowedTags = ["posts", "post", "menus", "settings", "template", "taxonomy", "sitemap"];

export async function GET(request: NextRequest) {
  // TODO: Add authentication eg. apikey parameter or something, or oonly allow from certain IP addresses
  if (!request.nextUrl.searchParams.has("tag")) {
    return NextResponse.json(
      { error: "Missing tag parameter" },
      { status: 400 }
    );
  }
  if (
    !allowedTags.includes(request.nextUrl.searchParams.get("tag") as string)
  ) {
    return NextResponse.json(
      { error: "Invalid tag parameter" },
      { status: 400 }
    );
  }
  const tag = request.nextUrl.searchParams.get("tag") as string;
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now(), tag: tag });
}
