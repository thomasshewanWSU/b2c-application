import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
