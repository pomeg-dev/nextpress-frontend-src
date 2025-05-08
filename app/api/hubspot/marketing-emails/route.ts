export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const emailId = searchParams.get("emailId");

    if (!emailId) {
      return new Response(
        JSON.stringify({ error: "No emailId param provided" }),
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_HUBSPOT_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.hubapi.com/marketing-emails/v1/emails/${emailId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error fetching Hubspot report:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Hubspot report" }),
      { status: 500 }
    );
  }
}
