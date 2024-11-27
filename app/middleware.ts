// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("elite_session");

  if (!token) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  try {
    await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY!)
    );
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|unauthorized).*)"],
};
