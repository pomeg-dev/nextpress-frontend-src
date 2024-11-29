import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY ||
    "your-very-secure-and-randomly-generated-secret-key"
);

// Define allowed paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  // Temporarily disable token checking by just passing through all requests
  return NextResponse.next();

  // Original implementation below, commented out for now
  /*
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication token is required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log("Decoded token:", payload);

    const userGroups = payload.groups as string[] || [];
    const requiredGroup = 'required-group-name';

    if (!userGroups.includes(requiredGroup)) {
      return new NextResponse(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-payload', JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Invalid authentication token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  */
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
