import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { SETTINGS_KEYS } from "@/utils/settings-keys";

const allowedTags = ["posts", "sitemap", "taxonomy"];
const allowedTagPrefixes = ["post-type-", "post-ids-"];

// Debounce mechanism for settings revalidation
let staggeredRevalidationActive = false;
let staggeredRevalidationTimeouts: NodeJS.Timeout[] = [];

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  const path = request.nextUrl.searchParams.get("path");
  
  // Must have either tag or path parameter
  if (!tag && !path) {
    return NextResponse.json(
      { error: "Missing tag or path parameter" },
      { status: 400 }
    );
  }
  
  // Handle tag-based revalidation
  if (tag) {
    // Handle settings staggered revalidation
    if (tag === 'settings') {
      // Check if staggered revalidation is already active
      if (staggeredRevalidationActive) {
        return NextResponse.json({ 
          message: 'Staggered revalidation already in progress',
          status: 'skipped',
          remainingTime: 'up to 60 seconds'
        });
      }
      
      // Clear any existing timeouts and start fresh
      staggeredRevalidationTimeouts.forEach(timeout => clearTimeout(timeout));
      staggeredRevalidationTimeouts = [];
      
      const totalKeys = SETTINGS_KEYS.length;
      const intervalMs = 60000 / totalKeys; // 60 seconds spread across all keys
      
      staggeredRevalidationActive = true;
      
      SETTINGS_KEYS.forEach((key, index) => {
        const timeout = setTimeout(() => {
          revalidateTag(key);
          console.log(`Revalidated settings key: ${key} (${index + 1}/${totalKeys})`);
          
          // Mark as inactive after the last revalidation
          if (index === totalKeys - 1) {
            staggeredRevalidationActive = false;
            staggeredRevalidationTimeouts = [];
          }
        }, index * intervalMs);
        
        staggeredRevalidationTimeouts.push(timeout);
      });
      
      return NextResponse.json({ 
        message: 'Staggered revalidation initiated for all settings keys',
        keys: SETTINGS_KEYS,
        totalDuration: '60 seconds',
        intervalMs: Math.round(intervalMs),
        status: 'started'
      });
    }
    
    // Handle individual settings key revalidation
    if (SETTINGS_KEYS.includes(tag)) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, now: Date.now(), key: tag });
    }
    
    // Handle other allowed tags
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
