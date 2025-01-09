import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "salesforce-login",
      name: "Salesforce",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Missing username or password");
          }

          const encodedUNPW = Buffer.from(
            `${credentials.username}:${credentials.password}`
          ).toString("base64");

          // Step 1: Get Authorization Code
          const authUrl =
            "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/authorize";

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
            "3MVG9p1oTaWVfF_xN9B9eNnIMcmLi9c9nZ6rfjnfc6gTrYPNM67JE0EKvHXtV_9slrWiT38XGs1S8l748A_Zp"
          );
          authParams.append(
            "redirect_uri",
            "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/echo"
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
          const tokenUrl =
            "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/token";

          const tokenParams = new URLSearchParams();
          tokenParams.append("grant_type", "authorization_code");
          tokenParams.append("code", code);
          tokenParams.append(
            "client_id",
            "3MVG9p1oTaWVfF_xN9B9eNnIMcmLi9c9nZ6rfjnfc6gTrYPNM67JE0EKvHXtV_9slrWiT38XGs1S8l748A_Zp"
          );
          tokenParams.append(
            "client_secret",
            "D6F650736C62833F8F76F921D95F50075757323E16B33C7B4F39A162645DBC59" // Replace with your actual client secret
          );
          tokenParams.append(
            "redirect_uri",
            "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/echo"
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
          const userInfoUrl =
            "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/userinfo";
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

          // Return user object with tokens and user info
          return {
            id: userInfo.user_id || tokenData.id,
            name: userInfo.name || credentials.username,
            email: userInfo.email || credentials.username,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            profile: userInfo, // Store full profile in the token
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
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tokenExpiry = Date.now() + 7200 * 1000; // Assuming 2 hour expiry
      }

      // Return previous token if the access token has not expired
      if (Date.now() < (token.tokenExpiry as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

async function refreshAccessToken(token: any) {
  try {
    const tokenUrl =
      "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/token";

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", token.refreshToken);
    params.append(
      "client_id",
      "3MVG9p1oTaWVfF_xN9B9eNnIMcmLi9c9nZ6rfjnfc6gTrYPNM67JE0EKvHXtV_9slrWiT38XGs1S8l748A_Zp"
    );
    params.append(
      "client_secret",
      "YOUR_CLIENT_SECRET" // Replace with your actual client secret
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

    // The error property will be used client-side to handle the refresh token error
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
