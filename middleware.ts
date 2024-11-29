import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  "your-very-secure-and-randomly-generated-secret-key"
);

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url);

  // Ignore requests for static assets (like images, CSS, JS)
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = searchParams.get("token");
  console.log("url", req.url);

  if (!token) {
    console.log("No token found in the request URL.");
    return NextResponse.next();
  }

  console.log("Received token:", token);

  try {
    // Use jose to verify the token
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log("Decoded token:", payload);

    // Check group membership
    if (payload.buyerGroup !== "Elite Access Group") {
      console.log(
        "User is not in the 'Elite Access Group'. Redirecting to no-access page."
      );
      return NextResponse.redirect("https://oraportal.com/no-access");
    }

    console.log(
      "User is in the 'Elite Access Group'. Allowing access to elite.oraportal.com."
    );
    return NextResponse.next();
  } catch (err) {
    if (err instanceof Error) {
      console.error("Invalid token:", err.message);
    } else {
      console.error("Invalid token:", err);
    }
    return NextResponse.redirect("https://oraportal.com/login");
  }
}
