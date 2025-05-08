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
        eventType
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
