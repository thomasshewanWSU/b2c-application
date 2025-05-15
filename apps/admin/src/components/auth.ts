import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { client } from "@repo/db/client";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// Configuration options - can be controlled via environment variables
const ENABLE_OAUTH_FOR_ADMIN = process.env.ENABLE_OAUTH_FOR_ADMIN === "true";
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
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(client.db),
  providers: [
    // Only include OAuth providers if enabled for admin
    ...(ENABLE_OAUTH_FOR_ADMIN
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
          GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    // Always include credentials provider
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find the user
        const user = await client.db.user.findUnique({
          where: { email: credentials.email },
        });

        // Check if user exists and is an admin
        if (!user || user.role !== "admin") {
          console.log("User not found or not admin:", credentials.email);
          return null;
        }

        // Verify password
        let passwordValid = false;
        if (user.password) {
          if (
            user.password.startsWith("$2a$") ||
            user.password.startsWith("$2b$")
          ) {
            passwordValid = await bcrypt.compare(
              credentials.password,
              user.password,
            );
          } else {
            // Fallback for development/testing
            passwordValid = credentials.password === user.password;
          }

          if (!passwordValid) {
            console.log("Invalid password for:", credentials.email);
            return null;
          }
        } else {
          // No password set (OAuth-only admin)
          console.log("No password set for admin:", credentials.email);
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
    async signIn({ user, account }) {
      // For OAuth providers - only allow existing admins to sign in
      if (account && account.provider !== "credentials") {
        // Look up the user in the database by email
        const dbUser = await client.db.user.findUnique({
          where: { email: user.email! },
        });

        // Only allow existing admin users to sign in via OAuth
        if (!dbUser || dbUser.role !== "admin") {
          console.log("OAuth login rejected: not an admin", user.email);
          return false; // Reject non-admin users
        }

        console.log("Admin OAuth login successful:", user.email);
        return true;
      }

      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;

        // Double-check that only admins can have sessions in admin app
        if (session.user.role !== "admin") {
          throw new Error("Access denied: admin role required");
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      // Verify the role is admin
      if (token.role !== "admin") {
        console.log("JWT creation rejected: not an admin", token.email);
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
    maxAge: 60 * 60, // 1 hour - shorter session for admin area
  },
  secret: process.env.ADMIN_AUTH_SECRET || process.env.AUTH_SECRET,
});
