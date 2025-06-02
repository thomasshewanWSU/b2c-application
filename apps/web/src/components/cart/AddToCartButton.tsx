"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AddToCartButton.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
type AddToCartButtonProps = {
  productId: number;
  quantity?: number;
  stock: number;
  className?: string;
  onAddSuccess?: () => void;
  compact?: boolean;
};

/**
 * AddToCartButton component allows users to add a product to their cart.
 * It handles stock availability, error messages, and success callbacks.
 *
 * @param {AddToCartButtonProps} props - The properties for the button.
 * @returns {JSX.Element} The rendered button component.
 */
export function AddToCartButton({
  productId,
  quantity = 1,
  stock,
  className = "",
  onAddSuccess,
  compact = false,
}: AddToCartButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (onAddSuccess) onAddSuccess();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to add to cart");
      errorTimeoutRef.current = setTimeout(() => setError(null), 3000);
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock <= 0) return;
    setError(null);
    addToCartMutation.mutate();
  };

  const buttonText = addToCartMutation.isPending
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
        disabled={addToCartMutation.isPending || stock <= 0}
        className={`${styles.addToCartButton} ${className} ${stock <= 0 ? styles.disabled : ""}`}
        aria-label="Add to cart"
        data-test-id="add-to-cart-button"
      >
        {buttonText}
      </button>
    </div>
  );
}
