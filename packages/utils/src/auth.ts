"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { client } from "@repo/db/client";
export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};
export async function isLoggedIn(jwtSecret: string): Promise<boolean> {
  const user = await getAuthUser(jwtSecret);
  return user !== null;
}
export async function getAuthUser(jwtSecret: string): Promise<AuthUser | null> {
  try {
    const authToken = (await cookies()).get("auth_token")?.value;

    if (!authToken) {
      return null;
    }

    const decoded = jwt.verify(authToken, jwtSecret) as {
      userId: number;
      email: string;
      name: string;
      role: string;
    };

    // Verify the user still exists in the database
    const user = await client.db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return null;
    }

    return user as AuthUser;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// Role-specific auth checkers
export async function isAdmin(jwtSecret: string): Promise<boolean> {
  const user = await getAuthUser(jwtSecret);
  return user !== null && user.role === "admin";
}

export async function isCustomer(jwtSecret: string): Promise<boolean> {
  const user = await getAuthUser(jwtSecret);
  return user !== null && user.role === "customer";
}
