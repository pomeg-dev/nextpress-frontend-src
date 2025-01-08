// app/api/auth/[...nextauth]/route.ts
import { foldl } from "async";
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

          const url =
            "https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/oauth2/authorize";

          const myHeaders = new Headers();
          myHeaders.append("Auth-Request-Type", "Named-User");
          myHeaders.append("Authorization", `Basic ${encodedUNPW}`);
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
          myHeaders.append(
            "Cookie",
            "BrowserId=nqRygq15Ee-kRQvRUiomZQ; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1; oinfo=c3RhdHVzPURFTU8mdHlwZT02Jm9pZD0wMEREZjAwMDAwMFFTMHY="
          );

          const urlencoded = new URLSearchParams();
          urlencoded.append("response_type", "code_credentials");
          urlencoded.append(
            "client_id",
            "3MVG9p1oTaWVfF_xN9B9eNnIMcmLi9c9nZ6rfjnfc6gTrYPNM67JE0EKvHXtV_9slrWiT38XGs1S8l748A_Zp"
          );
          urlencoded.append(
            "redirect_uri",
            "http://localhost:3000/api/auth/callback/salesforce"
          );

          const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
          };

          // Initial authorization request
          const authResponse = await fetch(url, requestOptions);

          const authData = await authResponse.json();
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
      if (user && account) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
