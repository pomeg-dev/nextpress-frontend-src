"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export function AuthCheck() {
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
        process.env.VERCEL_ENV === "preview";

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
