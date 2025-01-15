import { postLogin } from "@/lib/wp/user-flow";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "WordPress",
      credentials: {
        userLogin: { label: "Username", type: "text" },
        userPass: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        try {
          const response = await postLogin({
            user_login: credentials?.userLogin ?? null,
            user_password: credentials?.userPass ?? null,
            remember: credentials?.rememberMe ?? null,
            referrer: "nextauth",
          });

          console.log('res', response);

          if (response?.jwt_token) {
            return response;
          }
          return null;
        } catch (error) {
          if (error instanceof Error) {
            console.error("Login failed:", (error as any).response?.data || error.message);
          } else {
            console.error("Login failed:", error);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.user_id;
        token.token = user.jwt_token;
      }
      console.log('jwt', token, user);
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.token = token.token;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
