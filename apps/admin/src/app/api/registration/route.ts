import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin";
import { getAuthUser } from "../../../../../../packages/utils/src/auth";
import { isAdmin } from "@repo/utils";
export async function POST(request: Request) {
  try {
    // Verify the current user is an admin
    const isAdminUser = await isAdmin(process.env.JWT_SECRET || "");

    if (!isAdminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get registration data
    const { name, email, password } = await request.json();

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 },
      );
    }

    // Check if email is already in use
    const existingUser = await client.db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already in use" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new admin user
    const newUser = await client.db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin", // Always set as admin
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 },
    );
  }
}
