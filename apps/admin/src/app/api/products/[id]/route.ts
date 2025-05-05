import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
import { getAuthUser } from "../../../../utils/auth";

// Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await client.db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify admin user
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const { name, description, price, imageUrl, stock, category } =
      await request.json();

    // Validate required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !imageUrl ||
      stock === undefined ||
      !category
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if product exists
    const existingProduct = await client.db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Update product in database
    const updatedProduct = await client.db.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        stock: Number(stock),
        category,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 },
    );
  }
}

// Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin user
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    // Check if product exists
    const existingProduct = await client.db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Delete product from database
    await client.db.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
