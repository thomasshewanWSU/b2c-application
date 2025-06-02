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
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = parseInt((await params).id, 10);
    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    // Get existing order
    const existingOrder = await client.db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Update order status
    const updatedOrder = await client.db.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 },
    );
  }
}
