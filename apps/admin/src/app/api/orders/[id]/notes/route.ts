import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
import { isAdmin } from "@repo/utils";
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdminUser = await isAdmin(process.env.JWT_SECRET || "");

  if (!isAdminUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
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

    // Update order notes
    // Note: You would need to add a 'notes' field to your Order model in Prisma
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
