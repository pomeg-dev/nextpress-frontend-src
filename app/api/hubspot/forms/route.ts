export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const formId = searchParams.get("formId");
    const fetchAllPages = searchParams.get("fetchAllPages") === "true";
    const limit = searchParams.get("limit") || "50";

    if (!formId) {
      return new Response(
        JSON.stringify({ error: "No formId param provided" }),
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
    let url = `https://api.hubapi.com/form-integrations/v1/submissions/forms/${formId}?limit=${limit}`;

    // Get specific offset if provided (for manual pagination)
    const requestedAfter = searchParams.get("after");
    if (requestedAfter) {
      url += `&after=${requestedAfter}`;
    }

    let allResults: any[] = [];
    let hasMore = true;
    let after = null;

    do {
      let requestUrl = url;
      if (after && fetchAllPages) {
        requestUrl += `&after=${after}`;
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
          if (data.results) {
            allResults = [...allResults, ...data.results];
          }

          // HubSpot uses 'paging' object with 'next' property
          hasMore = !!data.paging?.next?.after;
          after = data.paging?.next?.after || null;

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
          JSON.stringify({ error: "Failed to fetch Hubspot form submissions", details: data }),
          { status: 500 }
        );
      }
    } while (hasMore && fetchAllPages);

    if (fetchAllPages) {
      return new Response(JSON.stringify({
        results: allResults,
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
    console.error("Error fetching Hubspot form submissions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Hubspot form submissions", details: error.message }),
      { status: 500 }
    );
  }
}