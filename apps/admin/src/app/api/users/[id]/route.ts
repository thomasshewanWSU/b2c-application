import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
/**
 * Update Order Status API Route
 *
 * Handles PATCH requests to update the status of a specific order.
 * Validates the order ID and ensures the status is one of the predefined values.
 *
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - The route parameters containing the order ID
 * @returns {Promise<NextResponse>} The response object with success status and updated order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 },
      );
    }

    // Get user with order count
    const user = await client.db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Format user for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      orderCount: user._count.orders,
      recentOrders: user.orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
