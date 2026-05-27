import { NextResponse } from "next/server";

const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts";

export async function PATCH(request: Request) {
  const apiKey = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!apiKey) {
    return NextResponse.json({ error: "HubSpot access token not configured" }, { status: 500 });
  }

  let body: { email?: string; contactId?: string; properties?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, contactId, properties } = body;

  if (!properties || Object.keys(properties).length === 0) {
    return NextResponse.json({ error: "properties is required" }, { status: 400 });
  }

  if (!email && !contactId) {
    return NextResponse.json({ error: "email or contactId is required" }, { status: 400 });
  }

  // Build URL — identify by contactId or by email property
  const identifier = contactId ?? email;
  const url = contactId
    ? `${HUBSPOT_API_URL}/${identifier}`
    : `${HUBSPOT_API_URL}/${identifier}?idProperty=email`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ properties }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("HubSpot update failed:", data);
    return NextResponse.json(
      { error: data.message ?? "Failed to update contact" },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true, contact: data });
}
