import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { client } from "@repo/db/client";
import { authOptions } from "@/server/auth-config";

// Zod schema for order validation
const OrderSchema = z.object({
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().nullable(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  total: z.number().min(0),
});

// POST: Create a new order
export async function POST(request: Request) {
  try {
    // Get the user ID from the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id, 10);

    // Parse and validate request body
    const body = await request.json();
    const orderData = OrderSchema.parse(body);

    // Get user's cart items
    const cartItems = await client.db.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    // Check if any cart item has insufficient stock
    let hasStockIssues = false;
    const stockIssues = [];

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        hasStockIssues = true;
        stockIssues.push({
          productId: item.productId,
          name: item.product.name,
          requested: item.quantity,
          available: item.product.stock,
        });
      }
    }

    // Immediately reject the order if ANY stock issues are found
    if (hasStockIssues) {
      // Consider returning a special status code to trigger cart refresh
      return NextResponse.json(
        {
          success: false,
          message:
            "Some items in your cart are no longer available in the requested quantity. Order cannot be processed.",
          stockIssues,
          requiresCartRefresh: true,
        },
        { status: 400 },
      );
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 },
      );
    }

    // Remove the second stock validation since we've already checked above
    // and will prevent race conditions by doing the full check in the transaction

    // Calculate total from cart items (ensuring price integrity)
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // Add shipping cost (mock - could be more complex)
    const shippingCost = subtotal > 100 ? 0 : 10;
    const calculatedTotal = subtotal + shippingCost;

    // Verify total matches for security
    if (Math.abs(calculatedTotal - orderData.total) > 0.01) {
      return NextResponse.json(
        { success: false, message: "Order total doesn't match cart total" },
        { status: 400 },
      );
    }

    // Create the order in a transaction with another stock check
    const order = await client.db.$transaction(async (tx) => {
      // CRITICAL: Double-check stock again inside transaction to prevent race conditions
      for (const item of cartItems) {
        // Get the latest product data within the transaction
        const freshProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!freshProduct || freshProduct.stock < item.quantity) {
          // Throw an error to abort the transaction
          throw new Error(
            `Not enough stock available for ${item.product.name}. Order cannot be processed.`,
          );
        }
      }

      // 1. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          status: "pending",
          total: calculatedTotal,
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          paymentMethod: orderData.paymentMethod,
          paymentId: `mock_payment_${Date.now()}`,
        },
      });

      // 2. Create all order items at once
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name,
          productBrand: item.product.brand || "",
          productImage: item.product.imageUrl || "",
        })),
      });

      // 3. Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });

    // Return successful response with order ID
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      redirectUrl: `/checkout/confirmation/${order.id}`,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Check if this is our stock validation error
    if ((error as Error).message.includes("Not enough stock available")) {
      return NextResponse.json(
        {
          success: false,
          message: (error as Error).message,
          requiresCartRefresh: true,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// GET: Get user's orders
export async function GET(request: Request) {
  try {
    // Get the user ID from the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id, 10);

    // Get URL params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Get orders for this user with pagination
    const orders = await client.db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                urlId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await client.db.order.count({
      where: { userId },
    });

    return NextResponse.json({
      orders,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
