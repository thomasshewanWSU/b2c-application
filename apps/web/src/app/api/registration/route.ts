import { NextResponse } from "next/server";
import { client } from "@repo/db/client";
import bcrypt from "bcryptjs";

// POST: Register a new user
export async function POST(request: Request) {
  try {
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

    // Create the new user
    const newUser = await client.db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "customer", // Default role for web users
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
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
