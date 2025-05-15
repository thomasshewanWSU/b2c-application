import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@repo/db/client";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

// Helper: Get user ID from auth token
async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? parseInt(session.user.id) : null;
}

// Helper: Get or create anonymous cart ID
async function getCartId() {
  const cookieStore = cookies();
  let cartId = (await cookieStore).get("cart_id")?.value;
  if (!cartId) {
    cartId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    (await cookieStore).set("cart_id", cartId, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return cartId;
}

// Helper: Get product and check stock
async function getProductAndCheckStock(productId: number) {
  const product = await client.db.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error("Product not found");
  if (product.stock <= 0) throw new Error("Out of Stock");
  return product;
}

// Zod schemas
const CartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).optional(),
});

// GET: Fetch the cart items
export async function GET() {
  try {
    const userId = await getUserId();
    let cartItems = [];
    if (userId) {
      const cart = await client.db.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
      cartItems = cart.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl,
        slug: item.product.urlId,
        stock: item.product.stock,
      }));
    } else {
      const cartId = await getCartId();
      const cart = await client.db.anonymousCartItem.findMany({
        where: { cartId },
        include: { product: true },
      });
      cartItems = cart.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl,
        slug: item.product.urlId,
        stock: item.product.stock,
      }));
    }
    return NextResponse.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// POST: Add item to cart
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = CartItemSchema.parse(body);

    const product = await getProductAndCheckStock(productId);

    const userId = await getUserId();
    let existingQuantity = 0;

    if (userId) {
      const existingItem = await client.db.cartItem.findFirst({
        where: { userId, productId },
      });
      existingQuantity = existingItem?.quantity || 0;
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
      if (existingItem) {
        await client.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await client.db.cartItem.create({
          data: { userId, productId, quantity },
        });
      }
      return NextResponse.json({
        success: true,
        message: "Item added to cart",
        requiresAuth: false,
      });
    } else {
      const cartId = await getCartId();
      const existingItem = await client.db.anonymousCartItem.findFirst({
        where: { cartId, productId },
      });
      existingQuantity = existingItem?.quantity || 0;
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
      if (existingItem) {
        await client.db.anonymousCartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await client.db.anonymousCartItem.create({
          data: { cartId, productId, quantity },
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
      {
        success: false,
        message: "Failed to add item to cart",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// PUT: Update cart item quantity
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity } = CartItemSchema.extend({
      quantity: z.number().min(1),
    }).parse(body);

    const product = await getProductAndCheckStock(productId);

    if (quantity > product.stock) {
      return NextResponse.json(
        { success: false, message: `Max Quantity reached.` },
        { status: 400 },
      );
    }

    const userId = await getUserId();
    if (userId) {
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
    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// DELETE: Remove item from cart
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { productId } = CartItemSchema.omit({ quantity: true }).parse(body);

    const userId = await getUserId();
    if (userId) {
      await client.db.cartItem.deleteMany({ where: { userId, productId } });
    } else {
      const cartId = await getCartId();
      await client.db.anonymousCartItem.deleteMany({
        where: { cartId, productId },
      });
    }
    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove item from cart",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
