"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AddToCartButton.module.css";
import { useCartContext } from "@/components/cart/CartProvider";

type AddToCartButtonProps = {
  productId: number;
  quantity?: number;
  stock: number;
  className?: string;
  onAddSuccess?: () => void;
  compact?: boolean;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  stock,
  className = "",
  onAddSuccess,
  compact = false,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCart, updateCartItemLocally } = useCartContext();
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (stock <= 0) return;

    setError(null);
    setIsAdding(true);

    // Optimistic update - add to cart locally first
    updateCartItemLocally(productId, quantity);

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
        if (onAddSuccess) {
          onAddSuccess();
        }
      } else {
        // Revert the optimistic update by refreshing cart
        refreshCart();

        // Show error from API
        setError(data.message || "Failed to add to cart");

        // Auto-hide error after 3 seconds
        errorTimeoutRef.current = setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      // Error handling remains the same...
    } finally {
      setIsAdding(false);
    }
  };

  // Determine button text based on state
  const buttonText = isAdding
    ? "Adding..."
    : stock <= 0
      ? "Out of Stock"
      : compact
        ? "Add"
        : "Add to Cart";

  return (
    <div className={styles.addToCartContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <button
        onClick={handleAddToCart}
        disabled={isAdding || stock <= 0}
        className={`${styles.addToCartButton} ${className} ${stock <= 0 ? styles.disabled : ""}`}
        aria-label="Add to cart"
      >
        {buttonText}
      </button>
    </div>
  );
}
