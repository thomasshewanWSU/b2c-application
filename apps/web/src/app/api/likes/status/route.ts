import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";

/**
 * GET handler - Checks if a user has already liked a specific post
 *
 * This function:
 * 1. Extracts the postId from query parameters
 * 2. Validates that a postId was provided
 * 3. Gets the user's IP address for identification
 * 4. Queries the database to check if a like record exists for this IP and post
 * 5. Returns a boolean indicating whether the user has liked the post
 *
 * @param request - The incoming request with postId as a query parameter
 * @returns A JSON response with hasLiked boolean status
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const existingLike = await client.db.like.findFirst({
      where: {
        postId: Number(postId),
        userIP: ip,
      },
    });

    return NextResponse.json({
      hasLiked: !!existingLike,
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 },
    );
  }
}
