import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/checkout", "/orders", "/account"];

// Routes that should redirect if already authenticated
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get the token from the request using next-auth JWT helper
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
    // Store the current URL to redirect back after login
    url.searchParams.set("returnUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // Case 2: Auth route and user is already authenticated
  if (authRoutes.some((route) => pathname === route) && isAuthenticated) {
    console.log(`Redirecting authenticated user from ${pathname} to /`);
    // Redirect to homepage or account page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
