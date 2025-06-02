import { NextResponse } from "next/server";
import { client } from "@repo/db/client";
/**
 * API Route to fetch filtered orders with pagination and sorting
 *
 * Handles GET requests to retrieve orders based on various filters and pagination.
 * Supports filtering by user ID, status, total amount range, date range, and sorting.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} The response object containing filtered orders and pagination metadata
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const userId = searchParams.get("userId") || "";
    const status = searchParams.get("status") || "";
    const minTotal = searchParams.get("minTotal")
      ? parseFloat(searchParams.get("minTotal") as string)
      : undefined;
    const maxTotal = searchParams.get("maxTotal")
      ? parseFloat(searchParams.get("maxTotal") as string)
      : undefined;
    const fromDate = searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate") as string)
      : undefined;
    const toDate = searchParams.get("toDate")
      ? new Date(searchParams.get("toDate") as string)
      : undefined;
    const sortBy = searchParams.get("sortBy") || "newest";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // User ID filter
    if (userId) {
      where.userId = parseInt(userId, 10);
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Total range filters
    if (minTotal !== undefined || maxTotal !== undefined) {
      where.total = {};
      if (minTotal !== undefined) {
        where.total.gte = minTotal;
      }
      if (maxTotal !== undefined) {
        where.total.lte = maxTotal;
      }
    }

    // Date range filters
    if (fromDate !== undefined || toDate !== undefined) {
      where.createdAt = {};
      if (fromDate !== undefined) {
        where.createdAt.gte = fromDate;
      }
      if (toDate !== undefined) {
        where.createdAt.lte = toDate;
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
      case "totalHigh":
        orderBy.total = "desc";
        break;
      case "totalLow":
        orderBy.total = "asc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    // Get filtered orders with pagination
    const orders = await client.db.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const total = await client.db.order.count({
      where,
    });

    // Get all distinct statuses for filter dropdown
    const statuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasMore: page < totalPages,
      },
      statuses,
    });
  } catch (error) {
    console.error("Error fetching filtered orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders", error: (error as Error).message },
      { status: 500 },
    );
  }
}
