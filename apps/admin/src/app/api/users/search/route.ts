import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: searchLower } },
        { email: { contains: searchLower } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
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
      case "nameAZ":
        orderBy.name = "asc";
        break;
      case "nameZA":
        orderBy.name = "desc";
        break;
      case "email":
        orderBy.email = "asc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    // Get filtered users with pagination
    const users = await client.db.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Get total count for pagination
    const total = await client.db.user.count({ where });

    // Format users for response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orders: user._count.orders,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: (error as Error).message },
      { status: 500 },
    );
  }
}
