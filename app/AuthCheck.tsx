"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

// Check if this is the Elite project
const isEliteProject = process.env.NEXT_PUBLIC_API_URL?.includes("elite");

function AuthCheckInner() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Check for token-based auth first
      const token = searchParams.get("token");
      const passcode = searchParams.get("passcode");

      // Handle passcode bypass for dev/preview environments
      const isDevOrPreview =
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

      console.log(
        "isDevOrPreview",
        isDevOrPreview,
        "NEXT_PUBLIC_VERCEL_ENV",
        process.env.NEXT_PUBLIC_VERCEL_ENV
      );
      if (isDevOrPreview && passcode) {
        try {
          const result = await signIn("token-login", {
            token: "validtoken", // This matches the dev token check in [...nextauth].ts
            redirect: false,
          });

          if (!result?.error) {
            return; // Successfully authenticated with passcode
          }
        } catch (error) {
          console.error("Passcode auth error:", error);
        }
      }

      // Handle normal token-based auth
      if (token && status === "unauthenticated") {
        try {
          const result = await signIn("token-login", {
            token,
            redirect: true,
          });

          if (result?.error) {
            console.error("Auth error:", result.error);
            if (!isDevOrPreview) {
              router.push("/register");
            }
          }
        } catch (error) {
          console.error("Auth error:", error);
          if (!isDevOrPreview) {
            router.push("/register");
          }
        }
      }
    };

    handleAuth();
  }, [searchParams, status, router]);

  return null;
}

export function AuthCheck() {
  // If not Elite project, don't render the auth component at all
  if (!isEliteProject) {
    return null;
  }

  return <AuthCheckInner />;
}
