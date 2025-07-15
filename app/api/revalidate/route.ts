import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const allowedTags = ["ssg", "posts", "post", "menus", "settings", "template", "taxonomy", "sitemap", "posts-feed"];
const allowedTagPrefixes = ["post-type-", "post-id-"];

export async function GET(request: NextRequest) {
  // TODO: Add authentication eg. apikey parameter or something, or only allow from certain IP addresses
  
  const tag = request.nextUrl.searchParams.get("tag");
  const path = request.nextUrl.searchParams.get("path");
  
  // Must have either tag or path parameter
  if (!tag && !path) {
    return NextResponse.json(
      { error: "Missing tag or path parameter" },
      { status: 400 }
    );
  }
  
  // Handle tag-based revalidation (existing functionality)
  if (tag) {
    const isAllowedTag = allowedTags.includes(tag);
    const isAllowedPrefix = allowedTagPrefixes.some(prefix => tag.startsWith(prefix));

    if (!isAllowedTag && !isAllowedPrefix) {
      return NextResponse.json(
        { error: "Invalid tag parameter" },
        { status: 400 }
      );
    }
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, now: Date.now(), tag: tag });
  }
  
  // Handle path-based revalidation (new functionality)
  if (path) {
    // Validate path format (must start with /)
    if (!path.startsWith('/')) {
      return NextResponse.json(
        { error: "Path must start with /" },
        { status: 400 }
      );
    }
    
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now(), path: path });
  }
}
