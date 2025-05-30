import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { client } from "@repo/db/client";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { type NextAuthOptions } from "next-auth";

// Define the same session and user interfaces
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(client.db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GH_CLIENT_ID!,
      clientSecret: process.env.GH_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await client.db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        if (user.password) {
          let passwordValid = false;
          if (
            user.password.startsWith("$2a$") ||
            user.password.startsWith("$2b$")
          ) {
            passwordValid = await bcrypt.compare(
              credentials.password,
              user.password,
            );
          } else {
            passwordValid = credentials.password === user.password;
          }

          if (!passwordValid) {
            return null;
          }
        } else {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow linking OAuth accounts to existing accounts
      if (account?.provider !== "credentials") {
        const existingUser = await client.db.user.findUnique({
          where: { email: user.email as string },
          include: { accounts: true },
        });

        // If user exists but doesn't have this OAuth account linked
        if (existingUser) {
          // Check if user already has an OAuth account of this provider
          const hasProvider = existingUser.accounts?.some(
            (acc) => acc.provider === account?.provider,
          );

          // If they don't have this provider linked, link it
          if (!hasProvider && account) {
            await client.db.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }

          // Flag this user for cart merging (new code)
          (user as any).needCartMerge = true;
          return true;
        }

        // For new users (email doesn't exist), create a new user
        if (!existingUser && user.email) {
          await client.db.user.create({
            data: {
              email: user.email,
              name: user.name || "Customer",
              role: "customer",
            },
          });
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Fix for the double-encoding issue
      try {
        // Check if this is an OAuth callback
        if (url.includes("/api/auth/callback/")) {
          // Add auth_success=true to the URL or baseUrl
          const separator = url.includes("?") ? "&" : "?";
          return `${url}${separator}auth_success=true`;
        }

        // Handle URLs that might be encoded or partially encoded
        if (url.includes("returnUrl=")) {
          const returnUrlMatch = url.match(/returnUrl=([^&]*)/);
          if (returnUrlMatch && returnUrlMatch[1]) {
            // First try to decode it once (in case it's single-encoded)
            let decodedUrl = decodeURIComponent(returnUrlMatch[1]);

            // If it's still encoded (starts with %2F), decode again
            if (decodedUrl.startsWith("%2F")) {
              decodedUrl = decodeURIComponent(decodedUrl);
            }

            // Construct proper return URL with auth_success for OAuth
            const separator = decodedUrl.includes("?") ? "&" : "?";
            return `${baseUrl}${decodedUrl}${separator}auth_success=true`;
          }
        }

        // Default NextAuth behavior
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      } catch (error) {
        // Fallback to base URL if something goes wrong
        return baseUrl;
      }
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;

        // Check if we need to merge cart for OAuth (new code)
        if ((token as any).needCartMerge) {
          try {
            // Make server-side request to merge cart
            const response = await fetch(
              `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cart`,
              {
                method: "PATCH",
                headers: {
                  Cookie: `next-auth.session-token=${(token as any).jti}`,
                },
              },
            );

            // Clear the flag after merging
            (token as any).needCartMerge = false;
          } catch (err) {
            console.error("Failed to merge cart in session callback", err);
          }
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;

        if ((user as any).needCartMerge) {
          (token as any).needCartMerge = true;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
