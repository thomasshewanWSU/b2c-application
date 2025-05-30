import { NextResponse } from "next/server";
import { client } from "@repo/db/client";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice") as string)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice") as string)
      : undefined;
    const stockStatus = searchParams.get("stockStatus") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search filter - remove the mode: "insensitive" option
    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        // For SQLite or providers that don't support 'mode'
        { name: { contains: searchLower } },
        { description: { contains: searchLower } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case "inStock":
          where.stock = { gt: 0 };
          break;
        case "lowStock":
          where.stock = { gt: 0, lte: 10 };
          break;
        case "outOfStock":
          where.stock = { equals: 0 };
          break;
      }
    }

    // Build orderBy clause for sorting
    const orderBy: any = {};
    switch (sortBy) {
      case "newest":
        orderBy.createdAt = "desc";
        break;
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "priceHigh":
        orderBy.price = "desc";
        break;
      case "priceLow":
        orderBy.price = "asc";
        break;
      case "nameAZ":
        orderBy.name = "asc";
        break;
      case "nameZA":
        orderBy.name = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }
    const activeStatus = searchParams.get("activeStatus");
    if (activeStatus) {
      switch (activeStatus) {
        case "active":
          where.active = true;
          break;
        case "inactive":
          where.active = false;
          break;
      }
    }
    // Get filtered products with pagination
    const products = await client.db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await client.db.product.count({
      where,
    });

    // Get all distinct categories for filter dropdown
    const categories = await client.db.product.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasMore: page < totalPages,
      },
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return NextResponse.json(
      { message: "Error fetching products", error: (error as Error).message },
      { status: 500 },
    );
  }
}
