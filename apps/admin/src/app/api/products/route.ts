import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
import { getAuthUser, isAdmin } from "@repo/utils";

// Get all products
export async function GET() {
  const isAdminUser = await isAdmin(process.env.JWT_SECRET || "");

  if (!isAdminUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const products = await client.db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
// Create a new product
export async function POST(request: NextRequest) {
  try {
    const isAdminUser = await isAdmin(process.env.JWT_SECRET || "");

    if (!isAdminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
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

    // Create product in database
    const product = await client.db.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        stock: Number(stock),
        category,
        urlId: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 },
    );
  }
}
