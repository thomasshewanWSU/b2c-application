"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartContext } from "@/components/cart/CartProvider"; // Add this import

export async function addToCart(productId: number, quantity: number = 1) {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        requiresAuth: data.requiresAuth,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to add to cart",
      };
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      message: "An error occurred while adding to cart",
    };
  }
}

export function useAddToCart() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const { refreshCart } = useCartContext(); // Add this

  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsAdding(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        refreshCart(); // Add this to refresh cart after successful addition

        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Failed to add to cart",
        };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      return {
        success: false,
        message: "An error occurred while adding to cart",
      };
    } finally {
      setIsAdding(false);
    }
  };

  return { addToCart, isAdding };
}
