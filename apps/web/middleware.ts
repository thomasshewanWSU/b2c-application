import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname;

  // Skip auth API routes to avoid circular dependencies
  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedPaths = ["/account", "/checkout"];
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp));

  if (isProtectedPath) {
    // Use getToken instead of auth() to avoid circular dependency
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    // If not authenticated, redirect to login
    if (!token) {
      const url = new URL(
        `/login?returnUrl=${encodeURIComponent(path)}`,
        req.url,
      );
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Update matcher to exclude auth API routes
export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    // Exclude auth API routes to avoid circular dependencies
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
