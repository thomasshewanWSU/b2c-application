import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { client } from "@repo/db/client";
import { authOptions } from "@/server/auth-config";

// GET: Get a specific order by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const orderId = parseInt((await params).id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    // Get the user ID from the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id, 10);

    // Get the order with its items
    const order = await client.db.order.findUnique({
      where: {
        id: orderId,
        userId: userId, // Ensure the order belongs to the authenticated user
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                urlId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
