export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const id = searchParams.get("id");

  if (!id) return new Response("Invalid ID", { status: 401 });
  (await draftMode()).enable();

  // Redirect to the path from the fetched post
  redirect("/draft/" + id);
}
