import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { client } from "@repo/db/client";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

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

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(client.db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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

        // Find user by email
        const user = await client.db.user.findUnique({
          where: { email: credentials.email },
        });

        // Check if user exists
        if (!user) {
          return null;
        }

        // Verify password if it exists
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
          // No password set (OAuth-only user)
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
      // For OAuth providers
      if (account && account.provider !== "credentials") {
        const email = user.email as string;

        // Check if user exists
        const existingUser = await client.db.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          // Create new user from OAuth with default "customer" role
          await client.db.user.create({
            data: {
              name: user.name || "Customer",
              email: email,
              role: "customer", // Default new OAuth users to customer
              password: null, // No password for OAuth users
            },
          });
        }

        // For existing users, respect their existing role
        return true;
      }

      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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
  secret: process.env.AUTH_SECRET,
};
