//api/auth/payload/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET_KEY ||
    "your-very-secure-and-randomly-generated-secret-key"
);

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const payload = cookieStore.get("auth_payload")?.value;

  if (!token || !payload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Verify the token is still valid
    await jwtVerify(token, SECRET_KEY);

    // Return the payload
    return NextResponse.json({ payload: JSON.parse(payload) });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
