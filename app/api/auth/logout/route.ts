//api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Create a new response
    const response = NextResponse.redirect(new URL("/", request.url));

    // Clear all auth-related cookies
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("next-auth.csrf-token");
    response.cookies.delete("next-auth.callback-url");

    // Also clear secure variants if you're using HTTPS
    response.cookies.delete("__Secure-next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.csrf-token");
    response.cookies.delete("__Secure-next-auth.callback-url");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
