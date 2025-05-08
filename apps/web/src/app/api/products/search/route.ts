import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log(
      "-----------------------------------123-----------------------------------",
    );
    // Extract filter params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice") as string)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice") as string)
      : undefined;

    // Get all brand parameters (handles multiple selections)
    const brandParams = searchParams.getAll("brand");
    const stockStatus = searchParams.get("stockStatus") || "";
    const sortBy = searchParams.get("sortBy") || "featured";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    let brandWhere: any = {
      brand: {
        not: null,
      },
    };

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: searchLower } },
        { description: { contains: searchLower } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Brand filter
    if (brandParams.length > 0) {
      // Filter out empty strings
      const filteredBrands = brandParams.filter((brand) => brand.trim() !== "");

      if (filteredBrands.length === 1) {
        // Single brand case
        where.brand = filteredBrands[0];
      } else if (filteredBrands.length > 1) {
        // Multiple brands case - use "in" operator
        where.brand = {
          in: filteredBrands,
        };
      }
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
      }
    }

    // Build orderBy clause for sorting
    const orderBy: any = {};
    switch (sortBy) {
      case "featured":
        orderBy.featured = "desc";
        break;
      case "priceAsc":
        orderBy.price = "asc";
        break;
      case "priceDesc":
        orderBy.price = "desc";
        break;
      case "newest":
        orderBy.createdAt = "desc";
        break;
      case "bestSelling":
        // This would require additional data tracking
        // For now, just default to featured
        orderBy.featured = "desc";
        break;
      default:
        orderBy.featured = "desc";
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
      orderBy: {
        category: "asc",
      },
    });

    // Get all distinct brands for filter dropdown

    const brands = await client.db.product.findMany({
      select: {
        brand: true,
      },
      where: brandWhere,
      distinct: ["brand"],
      orderBy: {
        brand: "asc",
      },
    });

    // Get min and max price for range filter
    interface PriceStats {
      min: number;
      max: number;
    }
    const priceStats = await client.db.$queryRaw<PriceStats[]>`
      SELECT MIN(price) as min, MAX(price) as max FROM Product
    `;

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
      brands: brands
        .map((b) => b.brand)
        .filter((brand): brand is string => brand !== null),
      priceRange: {
        min: priceStats[0]?.min || 0,
        max: priceStats[0]?.max || 1000,
      },
    });
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return NextResponse.json(
      { message: "Error fetching products", error: (error as Error).message },
      { status: 500 },
    );
  }
}
