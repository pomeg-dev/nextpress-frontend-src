import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const eventType = searchParams.get("eventType");
    const occurredAfter = searchParams.get("occurredAfter");
    const occurredBefore = searchParams.get("occurredBefore");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100000;

    const hubspotToken = process.env.NEXT_HUBSPOT_API_KEY;
    if (!hubspotToken) {
      return NextResponse.json({ error: "HubSpot not configured" }, { status: 500 });
    }

    const baseParams = new URLSearchParams();
    if (eventType) baseParams.set("eventType", eventType);
    if (occurredAfter) baseParams.set("occurredAfter", occurredAfter);
    if (occurredBefore) baseParams.set("occurredBefore", occurredBefore);

    const allEvents: any[] = [];
    let after: string | null = null;

    do {
      const params = new URLSearchParams(baseParams);
      params.set("limit", String(Math.min(limit - allEvents.length, 200)));
      if (after) params.set("after", after);

      const url = `https://api.hubapi.com/events/v3/events?${params.toString()}`;
      const eventsResponse = await fetch(
        url,
        { headers: { Authorization: `Bearer ${hubspotToken}` } }
      );

      if (!eventsResponse.ok) break;

      const data = await eventsResponse.json();
      allEvents.push(...(data.results || []));

      after = data.paging?.next?.after ?? null;
    } while (after && allEvents.length < limit);

    return NextResponse.json({ events: allEvents });

  } catch (error) {
    console.error("HubSpot events error:", error);
    return NextResponse.json({ events: [] });
  }
}
