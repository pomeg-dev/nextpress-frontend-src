export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignId = searchParams.get("campaignId");
    const eventType = searchParams.get("eventType");
    const fetchAllPages = searchParams.get("fetchAllPages") === "true";
    const limit = searchParams.get("limit") || "100";

    if (!campaignId || !eventType) {
      return new Response(
        JSON.stringify({ error: "No params provided" }),
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

    // Initial URL
    let url = `https://api.hubapi.com/email/public/v1/events?emailCampaignId=${campaignId}&eventType=${eventType}&limit=${limit}`;
    
    // Add optional appId parameter
    const appId = searchParams.get("appId");
    if (appId) {
      url += `&appId=${appId}`;
    }
    
    // Get specific offset if provided (for manual pagination)
    const requestedOffset = searchParams.get("offset");
    if (requestedOffset) {
      url += `&offset=${requestedOffset}`;
    }

    let allResults: any = [];
    let hasMore = true;
    let currentOffset = null;
    
    do {
      let requestUrl = url;
      if (currentOffset && fetchAllPages) {
        requestUrl += `&offset=${currentOffset}`;
      }
      
      const response = await fetch(requestUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to fetch from HubSpot API",
            status: response.status,
            statusText: response.statusText
          }),
          { status: response.status }
        );
      }

      const data = await response.json();
      
      if (data && data?.status !== "error") {
        if (fetchAllPages) {
          if (data.events) {
            allResults = [...allResults, ...data.events];
          }
          
          hasMore = data.hasMore || false;
          currentOffset = data.offset || null;
          
          // Safety check to prevent infinite loops
          if (allResults.length > 10000) {
            hasMore = false;
            console.warn("Safety limit reached (10,000 records) - pagination stopped");
          }
        } else {
          return new Response(JSON.stringify(data), { 
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to fetch Hubspot report", details: data }),
          { status: 500 }
        );
      }
    } while (hasMore && fetchAllPages);

    if (fetchAllPages) {
      return new Response(JSON.stringify({ 
        events: allResults,
        hasMore: false,
        count: allResults.length
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error: any) {
    console.error("Error fetching Hubspot report:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Hubspot report", details: error.message }),
      { status: 500 }
    );
  }
}