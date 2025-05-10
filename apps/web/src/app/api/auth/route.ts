import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/web";
import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // Get email and password from request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find the user in the database
    const user = await client.db.user.findUnique({
      where: { email },
    });

    // Check if user exists and is an admin
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Use bcrypt to compare the provided password with stored hash
    // If you don't have hashed passwords yet, you can skip this for development
    // and use direct comparison as fallback
    let passwordValid = false;

    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      // This is likely a bcrypt hash, use bcrypt.compare
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Fallback to direct comparison for development
      passwordValid = password === user.password;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
      },
      env.JWT_SECRET || "",
      { expiresIn: "8h" },
    );

    // Set the token in a cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 },
    );
  }
}
export async function DELETE() {
  try {
    // Get the cookie store
    const cookieStore = cookies();

    // Remove the auth_token cookie by setting it to expire
    (await cookieStore).set("auth_token", "", {
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during logout" },
      { status: 500 },
    );
  }
}
