import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
import { z } from "zod";

// Zod schema for query params
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
  search: z.string().optional().default(""),
  category: z.string().optional().default(""),
  minPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().optional(),
  ),
  maxPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().optional(),
  ),
  // Accepts either a string or an array of strings for brand
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  stockStatus: z.string().optional().default(""),
  sortBy: z.string().optional().default("featured"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Convert URLSearchParams to a plain object
    const paramsObj: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      // If the key already exists, convert to array
      if (paramsObj[key]) {
        paramsObj[key] = Array.isArray(paramsObj[key])
          ? [...paramsObj[key], value]
          : [paramsObj[key], value];
      } else {
        paramsObj[key] = value;
      }
    }

    // Parse and validate with Zod
    const params = querySchema.parse(paramsObj);

    // Destructure with defaults
    const {
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      stockStatus,
      sortBy,
    } = params;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: searchLower } },
        { brand: { contains: searchLower } },
      ];
    }

    // Category filter
    if (category) {
      // Use exact matching for categories from the dropdown
      where.category = category;
    }

    // Brand filter
    let brandParams: string[] = [];
    if (brand) {
      brandParams = Array.isArray(brand) ? brand : [brand];
      const filteredBrands = brandParams.filter((b) => b.trim() !== "");
      if (filteredBrands.length === 1) {
        where.brand = filteredBrands[0];
      } else if (filteredBrands.length > 1) {
        where.brand = { in: filteredBrands };
      }
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
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
        orderBy.featured = "desc";
        break;
      default:
        orderBy.featured = "desc";
    }
    console.log("Product search WHERE:", JSON.stringify(where, null, 2));

    // Get filtered products with pagination
    const products = await client.db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await client.db.product.count({ where });

    // Get all distinct categories for filter dropdown
    const categories = await client.db.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    // Get all distinct brands for filter dropdown
    const brands = await client.db.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    // Get min and max price for range filter
    interface PriceStats {
      min: number;
      max: number;
    }
    const minPriceAgg = await client.db.product.aggregate({
      _min: {
        price: true,
      },
    });

    const maxPriceAgg = await client.db.product.aggregate({
      _max: {
        price: true,
      },
    });

    const priceStats = {
      min: minPriceAgg._min.price || 0,
      max: maxPriceAgg._max.price || 1000,
    };

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
        min: priceStats.min || 0,
        max: priceStats.max || 1000,
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
