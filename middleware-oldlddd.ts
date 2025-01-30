import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  "your-very-secure-and-randomly-generated-secret-key"
);

const AUTH_COOKIE = "auth_token";
const PAYLOAD_COOKIE = "auth_payload";

// Separate cookie options for token and payload
const SECURE_COOKIE_OPTIONS = {
  httpOnly: true, // Token remains HttpOnly
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24,
  path: "/",
};

const PAYLOAD_COOKIE_OPTIONS = {
  httpOnly: false, // Payload is accessible to JavaScript
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24,
  path: "/",
};

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url);

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const urlToken = searchParams.get("token");
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value;
  const cookiePayload = req.cookies.get(PAYLOAD_COOKIE)?.value;

  if (urlToken) {
    try {
      const { payload } = await jwtVerify(urlToken, SECRET_KEY);

      const response = NextResponse.redirect(
        new URL(pathname, req.url).toString()
      );

      // Store token with HttpOnly flag
      response.cookies.set(AUTH_COOKIE, urlToken, SECURE_COOKIE_OPTIONS);

      // Store payload without HttpOnly flag so it's accessible to JavaScript
      response.cookies.set(
        PAYLOAD_COOKIE,
        JSON.stringify(payload),
        PAYLOAD_COOKIE_OPTIONS
      );

      return response;
    } catch (err) {
      console.error("Invalid URL token:", err);
      return NextResponse.redirect("https://oraportal.com/login");
    }
  }

  if (cookieToken && cookiePayload) {
    try {
      // Verify JWT is still valid
      await jwtVerify(cookieToken, SECRET_KEY);
      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect("https://oraportal.com/login");
      response.cookies.delete(AUTH_COOKIE);
      response.cookies.delete(PAYLOAD_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
  // return NextResponse.redirect("https://oraportal.com/login");
}

export const config = {
  matcher: ["/((?!api|_next|_static|favicon.ico|sitemap.xml).*)"],
};
