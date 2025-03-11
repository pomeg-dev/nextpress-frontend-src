export const dynamic = "force-dynamic";

import { getGA4Report, RequestBody } from "@/lib/server/ga";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const requestBodyString = searchParams.get("requestBody");
    const propertyId = searchParams.get("propertyId");

    if (!requestBodyString) {
      return new Response(
        JSON.stringify({ error: "No requestBody param provided" }),
        { status: 400 }
      );
    }

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: "No propertyId param provided" }),
        { status: 400 }
      );
    }

    const requestBody: RequestBody = JSON.parse(requestBodyString);

    const data = await getGA4Report(requestBody, propertyId);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching GA4 report:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch GA4 report" }),
      { status: 500 }
    );
  }
}
