import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
/**
 * POST handler - Adds a like to a post
 *
 * This function:
 * 1. Validates the postId is provided
 * 2. Gets the user's IP address for tracking
 * 3. Checks if the user already liked the post
 * 4. Creates a like record in the database
 * 5. Increments the post's like counter
 * 6. Returns the updated like count
 *
 * @param request - The incoming request containing postId
 * @returns A JSON response with the updated like count and status
 */
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

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

    if (existingLike) {
      return NextResponse.json(
        { error: "You already liked this post" },
        { status: 409 },
      );
    }

    await client.db.like.create({
      data: {
        postId: Number(postId),
        userIP: ip,
      },
    });

    const updatedPost = await client.db.post.update({
      where: { id: Number(postId) },
      data: {
        likes: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      likes: updatedPost.likes,
      userLiked: true,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}

/**
 * DELETE handler - Removes a like from a post
 *
 * This function:
 * 1. Validates the postId is provided
 * 2. Gets the user's IP address
 * 3. Finds the user's existing like
 * 4. Deletes the like record from the database
 * 5. Decrements the post's like counter
 * 6. Returns the updated like count
 *
 * @param request - The incoming request containing postId
 * @returns A JSON response with the updated like count and status
 */
export async function DELETE(request: NextRequest) {
  try {
    const { postId } = await request.json();

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

    if (!existingLike) {
      return NextResponse.json(
        { error: "You haven't liked this post" },
        { status: 404 },
      );
    }

    await client.db.like.delete({
      where: { id: existingLike.id },
    });

    const updatedPost = await client.db.post.update({
      where: { id: Number(postId) },
      data: {
        likes: { decrement: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      likes: updatedPost.likes,
      userLiked: false,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 500 },
    );
  }
}
