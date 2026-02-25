// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

// Check if this is the Elite project
const isEliteProject = process.env.NEXT_PUBLIC_API_URL?.includes("elite");

export function Providers({ children }: { children: React.ReactNode }) {
  // Only wrap with SessionProvider for Elite project
  if (!isEliteProject) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
