import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { client } from "@repo/db/client";
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

// This file configures NextAuth for the admin application
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(client.db),
  providers: [
    // Only include credentials provider for admin
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

        const user = await client.db.user.findUnique({
          where: { email: credentials.email },
        });

        // Check if user exists and is an admin
        if (!user || user.role !== "admin") {
          console.log("User not found or not admin:", credentials.email);
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
            console.log("Invalid password for:", credentials.email);
            return null;
          }
        } else {
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
    async redirect({ url, baseUrl }) {
      // Keep your existing redirect logic
      try {
        if (url.includes("returnUrl=")) {
          const returnUrlMatch = url.match(/returnUrl=([^&]*)/);
          if (returnUrlMatch && returnUrlMatch[1]) {
            let decodedUrl = decodeURIComponent(returnUrlMatch[1]);
            if (decodedUrl.startsWith("%2F")) {
              decodedUrl = decodeURIComponent(decodedUrl);
            }
            return `${baseUrl}${decodedUrl}`;
          }
        }

        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      } catch (error) {
        return baseUrl;
      }
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
  secret: process.env.NEXTAUTH_SECRET,
};
