// api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET_KEY ||
    "your-very-secure-and-randomly-generated-secret-key"
);

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "token-login",
      name: "Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        console.log("credentials authorize", credentials);
        try {
          // For local testing
          if (
            (process.env.NODE_ENV === "development" ||
              process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") &&
            credentials?.token === "validtoken"
          ) {
            return {
              id: "1",
              name: "Test User",
              email: "test@example.com",
              jdeAccountId: "4495", //example jde that will allow load of dash etc
              accessToken: "test-token",
              refreshToken: "test-refresh-token",
            };
          }

          if (!credentials?.token) {
            return null;
          }

          // Verify the JWT token
          const { payload } = await jwtVerify(credentials.token, SECRET_KEY);

          return {
            id: payload.sub as string,
            name: (payload.firstName as string) || (payload.lastName as string),
            email: payload.email as string,
            jdeAccountId: payload.JDE_Account_ID__c as string,
            accessToken: credentials.token,
            profile: payload,
          };
        } catch (error) {
          console.error("Token verification error:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "salesforce-login",
      name: "Salesforce",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("credentials22 authorize", credentials);
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Missing username or password");
          }

          // Your existing Salesforce authentication logic here
          const encodedUNPW = Buffer.from(
            `${credentials.username}:${credentials.password}`
          ).toString("base64");

          // Step 1: Get Authorization Code
          const authUrl = `${process.env.NEXT_PUBLIC_SALESFORCE_URL}services/oauth2/authorize`;
          const authHeaders = new Headers();
          authHeaders.append("Auth-Request-Type", "Named-User");
          authHeaders.append("Authorization", `Basic ${encodedUNPW}`);
          authHeaders.append(
            "Content-Type",
            "application/x-www-form-urlencoded"
          );
          authHeaders.append(
            "Cookie",
            "BrowserId=nqRygq15Ee-kRQvRUiomZQ; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1; oinfo=c3RhdHVzPURFTU8mdHlwZT02Jm9pZD0wMEREZjAwMDAwMFFTMHY="
          );

          const authParams = new URLSearchParams();
          authParams.append("response_type", "code_credentials");
          authParams.append(
            "client_id",
            process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!
          );
          authParams.append(
            "redirect_uri",
            // "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/echo"
            `${process.env.NEXT_PUBLIC_SALESFORCE_URL}services/oauth2/echo`
          );

          const authResponse = await fetch(authUrl, {
            method: "POST",
            headers: authHeaders,
            body: authParams,
          });

          if (!authResponse.ok) {
            throw new Error(`Authorization failed: ${authResponse.statusText}`);
          }

          const authData = await authResponse.json();
          const { code } = authData;

          if (!code) {
            throw new Error("No authorization code received");
          }

          // Step 2: Exchange Code for Tokens
          const tokenUrl = `${process.env.NEXT_PUBLIC_SALESFORCE_URL}services/oauth2/token`;

          const tokenParams = new URLSearchParams();
          tokenParams.append("grant_type", "authorization_code");
          tokenParams.append("code", code);
          tokenParams.append(
            "client_id",
            process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!
          );
          tokenParams.append(
            "client_secret",
            process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET!
          );
          tokenParams.append(
            "redirect_uri",
            `${process.env.NEXT_PUBLIC_SALESFORCE_URL}services/oauth2/echo`
          );

          const tokenResponse = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: tokenParams,
          });

          if (!tokenResponse.ok) {
            throw new Error(
              `Token exchange failed: ${tokenResponse.statusText}`
            );
          }

          const tokenData = await tokenResponse.json();

          // Fetch user info from Salesforce
          const userInfoUrl = `${process.env.NEXT_PUBLIC_SALESFORCE_URL}services/oauth2/userinfo`;
          const userInfoResponse = await fetch(userInfoUrl, {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          });

          if (!userInfoResponse.ok) {
            throw new Error(
              `Failed to fetch user info: ${userInfoResponse.statusText}`
            );
          }

          const userInfo = await userInfoResponse.json();

          return {
            id: userInfo.user_id || tokenData.id,
            name: userInfo.name || credentials.username,
            email: userInfo.email || credentials.username,
            jdeAccountId: userInfo.jdeAccountId || null,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            profile: userInfo,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // Store the auth token in a cookie for the payload route
      // if (account?.provider === "token-login" && user.accessToken) {
      //   const response = await fetch("/api/auth/set-token", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ token: user.accessToken }),
      //   });

      //   if (!response.ok) {
      //     return false;
      //   }
      // }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.jdeAccountId = (user as any).jdeAccountId;
        token.tokenExpiry = Date.now() + 7200 * 1000;
        token.provider = account.provider;
      }

      if (
        token.provider === "salesforce-login" &&
        Date.now() >= (token.tokenExpiry as number)
      ) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
        (session.user as any).provider = token.provider;
        (session.user as any).jdeAccountId = token.jdeAccountId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Remove token from URL.
      const cleanUrl = url.replace(/[?&]token=[^&]+/, "");
      const finalUrl = cleanUrl.replace(/\?$/, "");

      // If it's a relative URL, resolve it relative to the base URL
      if (finalUrl.startsWith("/")) {
        return `${baseUrl}${finalUrl}`;
      }
      // If it's already an absolute URL, just return ita
      else if (finalUrl.startsWith("http")) {
        return finalUrl;
      }
      // Default to the base URL
      return baseUrl;
    },
  },
  pages: {
    signIn: "/register",
    error: "/register",
  },
};

async function refreshAccessToken(token: any) {
  try {
    const tokenUrl = `${process.env.NEXT_PUBLIC_SALESFORCE_URL}services/oauth2/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", token.refreshToken);
    params.append("client_id", process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!);
    params.append(
      "client_secret",
      process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET!
    );

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      tokenExpiry: Date.now() + 7200 * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth(options);
export { handler as GET, handler as POST };
