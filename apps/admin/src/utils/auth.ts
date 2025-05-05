import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin";
import { client } from "@repo/db/client";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function isLoggedIn(): Promise<boolean> {
  try {
    const user = await getAuthUser();
    return user !== null && user.role === "admin";
  } catch (error) {
    return false;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const authToken = (await cookies()).get("auth_token")?.value;

    if (!authToken) {
      return null;
    }

    const decoded = jwt.verify(authToken, env.JWT_SECRET || "") as {
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

    if (!user || user.role !== "admin") {
      return null;
    }

    return user as AuthUser;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
