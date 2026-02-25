// api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { options } from "./options";

// Check if this is the Elite project
const isEliteProject = process.env.NEXT_PUBLIC_API_URL?.includes("elite");

// Only enable NextAuth for Elite project
const handler = isEliteProject
  ? NextAuth(options)
  : () =>
      NextResponse.json(
        { error: "Authentication not configured for this project" },
        { status: 404 }
      );

export { handler as GET, handler as POST };
