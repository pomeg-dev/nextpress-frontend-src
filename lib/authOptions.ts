import { postLogin } from "@/lib/wp/user-flow";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "WordPress",
      credentials: {
        userLogin: { label: "Username", type: "text" },
        userPass: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
        referrer: { label: "Referrer", type: "text" },
      },
      async authorize(credentials) {
        try {
          const response = await postLogin({
            user_login: credentials?.userLogin ?? null,
            user_password: credentials?.userPass ?? null,
            remember: credentials?.rememberMe ?? null,
          });

          if (response?.success && response?.jwt_token) {
            return response;
          }

          return null;
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.token = user.jwt_token;
        token.id = user.user_id;
        token.name = user.user_display_name;
        token.email = user.user_email;
        token.blog_id = user.blog_id;
        token.blog_url = user.blog_url;
        token.is_admin = user.is_admin;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.token = token.token;
        session.user.blog_id = token.blog_id;
        session.user.blog_url = token.blog_url;
        session.user.is_admin = token.is_admin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};