import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

// Get JWT_SECRET from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(request: NextRequest) {
  // Bypass middleware for login-related routes
  if (
    request.nextUrl.pathname === "/api/auth/" ||
    request.nextUrl.pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const authToken = request.cookies.get("auth_token")?.value;

  // If there's no auth token, redirect to login
  if (!authToken) {
    console.log("No auth token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the JWT token using jose
  try {
    // Create a TextEncoder to encode the JWT_SECRET
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verify the token
    const { payload } = await jose.jwtVerify(authToken, secret);

    // Check if the user has admin role
    if (payload.role !== "admin") {
      console.log("User is not an admin, logging them out");

      // Create a response that will redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));

      // Clear the auth token cookie
      response.cookies.delete("auth_token");

      // You could also set a temporary message cookie to show an error
      response.cookies.set("auth_error", "Admin access required", {
        maxAge: 5, // Short-lived cookie
        path: "/",
      });

      return response;
    }
  } catch (error) {
    console.error("Invalid JWT token:", error);

    // Clear the invalid token and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");

    return response;
  }

  return NextResponse.next();
}

// Keep your existing matcher configuration
export const config = {
  matcher: [
    "/((?!login|api/auth|api/auth/|_next/static|_next/image|favicon.ico).*)",
  ],
};
