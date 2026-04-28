export async function getEmailProps(
  emailId: string
) {
  try {
    const url =
      process.env.NEXT_PUBLIC_FRONTEND_URL +
      "/api/hubspot/marketing-emails?" +
      new URLSearchParams({
        emailId,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 86400, tags: ["hubspot"] },
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching GA4 report API:", error);
    return null;
  }
}

export async function getEmailSubmissions(
  campaignId: string,
  eventType: string,
) {
  try {
    const url =
      process.env.NEXT_PUBLIC_FRONTEND_URL +
      "/api/hubspot/email?" +
      new URLSearchParams({
        campaignId,
        eventType,
        fetchAllPages: "true"
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 86400, tags: ["hubspot"] },
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching email submissions:", error);
    return null;
  }
}

export async function getFormSubmissions(
  formId: string,
) {
  try {
    const url =
      process.env.NEXT_PUBLIC_FRONTEND_URL +
      "/api/hubspot/forms?" +
      new URLSearchParams({
        formId,
        fetchAllPages: "true"
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 86400, tags: ["hubspot"] },
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return null;
  }
}

export async function getEvents(
  event_name: string,
  from?: string,
  to?: string,
) {
  try {
    const params: Record<string, string> = { eventType: event_name };
    if (from) params.occurredAfter = new Date(from).toISOString();
    if (to) params.occurredBefore = new Date(`${to}T23:59:59`).toISOString();

    const url =
      process.env.NEXT_PUBLIC_FRONTEND_URL +
      "/api/hubspot/events?" +
      new URLSearchParams(params);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 86400, tags: ["hubspot"] },
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return null;
  }
}
