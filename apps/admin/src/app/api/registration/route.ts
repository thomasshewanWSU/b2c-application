import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin";
import { getAuthUser } from "../../../utils/auth";

export async function POST(request: Request) {
  try {
    // Verify the current user is an admin
    const currentUser = await getAuthUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Only admins can create admin accounts",
        },
        { status: 403 },
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

    // Log the action for audit purposes
    console.log(`Admin user created: ${email} by ${currentUser.email}`);

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
