import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    return NextResponse.json({
      ip: data.ip,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || "unknown",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
