import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose"; // Use jose instead of jsonwebtoken

// Get JWT_SECRET from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(request: NextRequest) {
  // Bypass middleware for login-related routes
  if (request.nextUrl.pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const authToken = request.cookies.get("auth_token")?.value;

  // If there's no auth token, redirect to login
  if (!authToken) {
    console.log("No auth token, redirecting to login");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verify the JWT token using jose
  try {
    // Create a TextEncoder to encode the JWT_SECRET
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verify the token
    const { payload } = await jose.jwtVerify(authToken, secret);

    // Check if the user has admin role
    if (payload.role !== "admin") {
      console.log("User is not an admin, redirecting");
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Invalid JWT token:", error);
    // If verification fails, redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Keep your existing matcher configuration
export const config = {
  matcher: ["/((?!api/auth/login|_next/static|_next/image|favicon.ico|$).*)"],
};
