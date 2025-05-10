import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { getAuthUser } from "@repo/utils";

// Helper function to get user ID from auth token
async function getUserId() {
  const user = await getAuthUser(process.env.JWT_SECRET || "");
  return user?.id;
}

// Helper function for anonymous cart management
async function getCartId() {
  const cookieStore = cookies();
  let cartId = (await cookieStore).get("cart_id")?.value;

  if (!cartId) {
    cartId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    (await cookieStore).set("cart_id", cartId, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return cartId;
}

// GET: Fetch the cart items
export async function GET() {
  try {
    // Check if user is authenticated
    const userId = await getUserId();
    let cartItems = [];

    if (userId) {
      // Get cart items for authenticated user
      const cart = await client.db.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
        },
      });

      cartItems = cart.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl,
        slug: item.product.urlId, // Using urlId as slug
        stock: item.product.stock, // Make sure this is included
      }));
    } else {
      // Get cart items for anonymous user
      const cartId = await getCartId();
      const cart = await client.db.anonymousCartItem.findMany({
        where: { cartId },
        include: {
          product: true,
        },
      });

      cartItems = cart.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl, // Make sure field name matches schema
        slug: item.product.urlId, // Using urlId as slug
        stock: item.product.stock, // Make sure this is included
      }));
    }

    return NextResponse.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}
// Within your POST function, add this validation:
export async function POST(request: Request) {
  try {
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    // Verify product exists and check stock
    const product = await client.db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Stock validation
    if (product.stock <= 0) {
      return NextResponse.json(
        { success: false, message: "Out of Stock" },
        { status: 400 },
      );
    }

    const userId = await getUserId();
    let existingQuantity = 0;

    // Check current quantity in cart (either user cart or anonymous cart)
    if (userId) {
      const existingItem = await client.db.cartItem.findFirst({
        where: { userId, productId },
      });
      existingQuantity = existingItem?.quantity || 0;
    } else {
      const cartId = await getCartId();
      const existingItem = await client.db.anonymousCartItem.findFirst({
        where: { cartId, productId },
      });
      existingQuantity = existingItem?.quantity || 0;
    }

    // Unified stock validation
    if (existingQuantity + quantity > product.stock) {
      const remaining = product.stock - existingQuantity;
      return NextResponse.json(
        {
          success: false,
          message:
            remaining > 0
              ? `Cannot add ${quantity} more items. Only ${remaining} more available.`
              : `You already have the maximum available quantity in your cart.`,
        },
        { status: 400 },
      );
    }
    if (userId) {
      // Check current quantity in cart
      const existingItem = await client.db.cartItem.findFirst({
        where: { userId, productId },
      });

      if (existingItem) {
        existingQuantity = existingItem.quantity;

        // Check if adding would exceed stock
        if (existingQuantity + quantity > product.stock) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot add ${quantity} more items. Only ${product.stock - existingQuantity} more available.`,
            },
            { status: 400 },
          );
        }

        // Update quantity if item already exists
        await client.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        // Check if quantity exceeds stock
        if (quantity > product.stock) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot add ${quantity} items. Only ${product.stock} available.`,
            },
            { status: 400 },
          );
        }

        // Add new item to cart
        await client.db.cartItem.create({
          data: {
            userId,
            productId,
            quantity,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Item added to cart",
        requiresAuth: false,
      });
    } else {
      // Anonymous cart code with similar validation
      const cartId = await getCartId();
      const existingItem = await client.db.anonymousCartItem.findFirst({
        where: { cartId, productId },
      });

      if (existingItem) {
        existingQuantity = existingItem.quantity;

        // Check if adding would exceed stock
        if (existingQuantity + quantity > product.stock) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot add ${quantity} more items. Only ${product.stock - existingQuantity} more available.`,
            },
            { status: 400 },
          );
        }

        await client.db.anonymousCartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        // Check if quantity exceeds stock
        if (quantity > product.stock) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot add ${quantity} items. Only ${product.stock} available.`,
            },
            { status: 400 },
          );
        }

        await client.db.anonymousCartItem.create({
          data: {
            cartId,
            productId,
            quantity,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Item added to anonymous cart",
        requiresAuth: true,
      });
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}

// Update the PUT method to also check for stock limits:
export async function PUT(request: Request) {
  try {
    const { productId, quantity } = await request.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Product ID and quantity are required" },
        { status: 400 },
      );
    }

    // Verify product exists and check stock
    const product = await client.db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Unified stock validation
    if (quantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Max Quantity reached.`,
        },
        { status: 400 },
      );
    } else if (product.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Out of Stock.`,
        },
        { status: 400 },
      );
    }

    // Check if user is authenticated
    const userId = await getUserId();

    if (userId) {
      // Update user's cart
      const existingItem = await client.db.cartItem.findFirst({
        where: { userId, productId },
      });

      if (existingItem) {
        await client.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity },
        });
      }
    } else {
      // Update anonymous cart
      const cartId = await getCartId();
      const existingItem = await client.db.anonymousCartItem.findFirst({
        where: { cartId, productId },
      });

      if (existingItem) {
        await client.db.anonymousCartItem.update({
          where: { id: existingItem.id },
          data: { quantity },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart" },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    // Check if user is authenticated
    const userId = await getUserId();

    if (userId) {
      // Remove from user's cart
      await client.db.cartItem.deleteMany({
        where: {
          userId,
          productId,
        },
      });
    } else {
      // Remove from anonymous cart
      const cartId = await getCartId();
      await client.db.anonymousCartItem.deleteMany({
        where: {
          cartId,
          productId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove item from cart" },
      { status: 500 },
    );
  }
}
