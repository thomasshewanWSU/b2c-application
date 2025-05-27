import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { RateLimiter } from "limiter";

// Routes that require authentication
const protectedRoutes = ["/checkout", "/orders", "/account"];

// Routes that should redirect if already authenticated
const authRoutes = ["/login", "/register"];

// Rate limiting configuration - more generous than admin side
const limiters = new Map<string, RateLimiter>();
const MAX_REQUESTS = 150; // Higher limit for regular users
const TIME_WINDOW = "minute";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
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
          message: "Too many requests. Please try again later.",
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

  // Original authentication logic
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Case 1: Protected route but user is not authenticated
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
    const url = new URL("/login", request.url);
    url.searchParams.set("returnUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // Case 2: Auth route and user is already authenticated
  if (authRoutes.some((route) => pathname === route) && isAuthenticated) {
    console.log(`Redirecting authenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

// Update matcher to include API routes for rate limiting
export const config = {
  matcher: [
    "/api/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
