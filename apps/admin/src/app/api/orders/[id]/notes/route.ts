import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";

/**
 * Update Order Notes API Route
 *
 * Handles PATCH requests to update the notes for a specific order.
 * Validates the order ID and ensures the notes are within length limits.
 *
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - The route parameters containing the order ID
 * @returns {Promise<NextResponse>} The response object with success status and updated notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = parseInt((await params).id, 10);
    const { notes } = await request.json();

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

    // Validate notes length
    const updatedOrder = await client.db.order.update({
      where: { id },
      data: {
        notes,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order notes updated successfully",
      notes: updatedOrder.notes,
    });
  } catch (error) {
    console.error("Error updating order notes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notes" },
      { status: 500 },
    );
  }
}
