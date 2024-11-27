import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect("/unauthorized");
  }

  try {
    // Verify the JWT from Salesforce
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY!)
    );

    // Create a new session cookie for your Next.js site
    cookies().set("elite_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    });

    return NextResponse.redirect("/dashboard");
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect("/unauthorized");
  }
}
