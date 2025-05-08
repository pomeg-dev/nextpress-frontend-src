import { RequestBody } from "./server/ga";

export async function getGA4ReportApi(
  requestBody: RequestBody,
  propertyId: string
) {
  try {
    const url =
      process.env.NEXT_PUBLIC_FRONTEND_URL +
      "/api/ga?" +
      new URLSearchParams({
        requestBody: JSON.stringify(requestBody),
        propertyId,
      });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 86400, tags: ["ga4report"] },
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching GA4 report API:", error);
    return null;
  }
}
