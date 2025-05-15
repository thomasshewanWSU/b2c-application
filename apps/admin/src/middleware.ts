import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import { RateLimiter } from "limiter";
// Get JWT_SECRET from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "";

const limiters = new Map<string, RateLimiter>();

const MAX_REQUESTS = 100;
const TIME_WINDOW = "minute";

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Create limiter for this IP if it doesn't exist
    if (!limiters.has(ip)) {
      limiters.set(
        ip,
        new RateLimiter({
          tokensPerInterval: MAX_REQUESTS,
          interval: TIME_WINDOW,
        }),
      );
    }

    // Get the limiter for this IP
    const limiter = limiters.get(ip)!;

    // Try to remove a token (returns false if rate limit exceeded)
    const hasToken = await limiter.tryRemoveTokens(1);

    if (!hasToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60", // seconds until rate limit resets
            "X-RateLimit-Limit": MAX_REQUESTS.toString(),
          },
        },
      );
    }
  }
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
