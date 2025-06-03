import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";

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

// Update a product
export async function PUT(
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

    const {
      name,
      description,
      price,
      imageUrl,
      stock,
      category,
      active, // Add the active property here
      brand, // Add other properties you might want to update
      detailedDescription,
      specifications,
    } = await request.json();

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
        active: active !== undefined ? active : existingProduct.active, // Include the active status
        brand: brand || existingProduct.brand,
        detailedDescription:
          detailedDescription || existingProduct.detailedDescription,
        specifications: specifications || existingProduct.specifications,
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

// Deactivate a product (soft delete)
export async function DELETE(
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

    // Update product to set active=false instead of deleting
    const updatedProduct = await client.db.product.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product successfully deactivated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error deactivating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to deactivate product" },
      { status: 500 },
    );
  }
}
