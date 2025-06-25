import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!hubspotToken) {
      return NextResponse.json({ error: "HubSpot not configured" }, { status: 500 });
    }

    // Get contact by email
    const contactResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`,
      {
        headers: { Authorization: `Bearer ${hubspotToken}` }
      }
    );

    if (!contactResponse.ok) {
      return NextResponse.json({ runHistory: [] });
    }

    const contact = await contactResponse.json();

    // Get custom events for this contact
    const eventsResponse = await fetch(
      `https://api.hubapi.com/events/v3/events?objectType=contact&objectId=${contact.id}&eventType=pe46500455_benchmarking_calculator_ran&limit=200`,
      {
        headers: { Authorization: `Bearer ${hubspotToken}` }
      }
    );

    if (!eventsResponse.ok) {
      return NextResponse.json({ runHistory: [] });
    }

    const eventsData = await eventsResponse.json();
    const events = eventsData.results || [];

    // Transform to simple format
    const runHistory = events.map((event: any) => ({
      timestamp: event.occurredAt,
      aban8: event.properties?.benchmarking_aban8 || null,
      metrics: [
        event.properties?.benchmarking_metric1,
        event.properties?.benchmarking_metric2,
        event.properties?.benchmarking_metric3,
        event.properties?.benchmarking_metric4
      ],
    }));

    return NextResponse.json({ runHistory });

  } catch (error) {
    console.error("Benchmarking history error:", error);
    return NextResponse.json({ runHistory: [] });
  }
}