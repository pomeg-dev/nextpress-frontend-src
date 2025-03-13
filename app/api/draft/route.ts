// route handler with secret and slug
export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";

import { getPostByID, getPostByPath } from "@/lib/api";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const id = searchParams.get("id");

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  //   if (secret !== 'MY_SECRET_TOKEN' || !ID) {
  //     return new Response('Invalid token', { status: 401 })
  //   }

  // Fetch the headless CMS to check if the provided `ID` exists
  // getPostBySlug would implement the required fetching logic to the headless CMS
  if (!id) return new Response("Invalid ID", { status: 401 });

  // const post = await getPostByID(id);

  // If the ID doesn't exist prevent draft mode from being enabled
  // if (!post) {
  //   return new Response("Invalid ID", { status: 401 });
  // }

  // Enable Draft Mode by setting the cookie
  (await draftMode()).enable();

  // Redirect to the path from the fetched post
  redirect("/draft/" + id);
}
