import { useState, useEffect } from "react";

interface UserData {
  firstName?: string;
  name?: string;
  email?: string;
}

export function useAuth() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try JWT payload first
        const payloadResponse = await fetch("/api/auth/payload");
        if (payloadResponse.ok) {
          const data = await payloadResponse.json();
          if (data.payload?.firstName) {
            setUserData({
              firstName: data.payload.firstName,
              email: data.payload.email,
            });
            setLoading(false);
            return;
          }
        }

        // If JWT fails, try NextAuth session
        const sessionResponse = await fetch("/api/auth/session");
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (session?.user) {
            setUserData({
              firstName: session.user.name?.split(" ")[0] || "User",
              name: session.user.name,
              email: session.user.email,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return {
    user: userData,
    loading,
    isAuthenticated: !!userData,
  };
}
