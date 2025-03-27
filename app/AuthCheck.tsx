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
      const token = searchParams.get("token");

      if (token && status === "unauthenticated") {
        try {
          const result = await signIn("token-login", {
            token,
            redirect: true,
          });

          if (result?.error) {
            console.log("Auth error:", result.error);
            router.push("/register");
          }
        } catch (error) {
          console.error("Auth error:", error);
          router.push("/register");
        }
      }
    };

    handleAuth();
  }, [searchParams, status, router]);

  return null;
}
