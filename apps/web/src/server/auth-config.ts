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
  secret: process.env.NEXTAUTH_SECRET,
};
