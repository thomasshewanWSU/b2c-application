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
export async function GET() {
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
    const {
      name,
      description,
      price,
      imageUrl,
      stock,
      category,
      brand,
      specifications,
      detailedDescription,
    } = await request.json();
    // Validate required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !imageUrl ||
      stock === undefined ||
      !category ||
      !brand ||
      !specifications ||
      !detailedDescription
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }
    const baseUrlId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const existingProducts = await client.db.product.findMany({
      where: {
        urlId: {
          startsWith: baseUrlId,
        },
      },
    });
    await client.db
      .$executeRaw`SELECT setval('"Product_id_seq"', (SELECT MAX(id) FROM "Product")+1);`;

    const urlId =
      existingProducts.length > 0
        ? `${baseUrlId}-${existingProducts.length + 1}`
        : baseUrlId;
    // Create product in database
    const product = await client.db.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        stock: Number(stock),
        category,
        urlId,
        brand,
        specifications,
        detailedDescription,
        featured: false,
        active: true,
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
