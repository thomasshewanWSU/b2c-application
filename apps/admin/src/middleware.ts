import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiter } from "limiter";
import { getToken } from "next-auth/jwt";

// Rate limiting configuration
const limiters = new Map<string, RateLimiter>();
const MAX_REQUESTS = 100;
const TIME_WINDOW = "minute";

// Routes that don't require authentication
const publicRoutes = ["/login", "/api/auth/signin"];

// API routes that should bypass auth checks (extended to include all NextAuth paths)
const publicApiRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // PART 1: Handle rate limiting for API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!limiters.has(ip)) {
      limiters.set(
        ip,
        new RateLimiter({
          tokensPerInterval: MAX_REQUESTS,
          interval: TIME_WINDOW,
        }),
      );
    }

    const limiter = limiters.get(ip)!;
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
            "Retry-After": "60",
            "X-RateLimit-Limit": MAX_REQUESTS.toString(),
          },
        },
      );
    }
  }

  // PART 2: Check if route should bypass authentication
  if (
    publicRoutes.some((route) => pathname === route) ||
    publicApiRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // PART 3: Authentication & role verification
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "",
    });

    // If no token or not admin role, redirect to login
    if (!token) {
      console.log("No authentication token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check admin role
    if (token.role !== "admin") {
      console.log("User is not an admin, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Allow the request to proceed for authenticated admin users
    return NextResponse.next();
  } catch (error) {
    console.error("Auth error in middleware:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Update matcher to exclude NextAuth-related paths
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
