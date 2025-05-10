"use client";

import { useState, useEffect } from "react";
import styles from "./QuantityControls.module.css";
import { QuantityToggle } from "./QuantityToggle";
import { AddToCartButton } from "./AddToCartButton";
import { useQuery } from "@tanstack/react-query";
type QuantityControlsProps = {
  productId: number;
  stock: number;
  className?: string;
  compact?: boolean;
  showQuantitySelector?: boolean;
  defaultQuantity?: number;
  onCartStatusChange?: (inCart: number | null) => void;
};

export function QuantityControls({
  productId,
  stock,
  className = "",
  compact = false,
  showQuantitySelector = false,
  defaultQuantity = 1,
  onCartStatusChange,
}: QuantityControlsProps) {
  const [inCart, setInCart] = useState<number | null>(null);
  const [checkingCart, setCheckingCart] = useState(true);
  const [quantity, setQuantity] = useState(defaultQuantity);

  // Check if item is in cart - use cartItems from context
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  const cartItems = data?.items || [];
  useEffect(() => {
    const cartItem = cartItems.find(
      (item: { id: number }) => item.id === productId,
    );
    setInCart(cartItem ? cartItem.quantity : null);

    if (onCartStatusChange) {
      onCartStatusChange(cartItem ? cartItem.quantity : null);
    }
  }, [productId, cartItems, onCartStatusChange]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  // Don't render anything while checking cart status
  // Don't render anything while cart is loading or fetching
  if (isLoading || isFetching) {
    return <div className={`${styles.loadingPlaceholder} ${className}`}></div>;
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {inCart ? (
        <div className={styles.inCartControls}>
          {!compact && (
            <span className={styles.inCartMessage}>In your cart:</span>
          )}
          <QuantityToggle
            productId={productId}
            initialQuantity={inCart}
            maxQuantity={stock}
          />
        </div>
      ) : (
        <div className={styles.addToCartControls}>
          {showQuantitySelector && stock > 0 && (
            <div className={styles.quantityRow}>
              <label
                htmlFor={`quantity-${productId}`}
                className={styles.quantityLabel}
              >
                Quantity:
              </label>
              <select
                id={`quantity-${productId}`}
                className={styles.quantitySelect}
                value={quantity}
                onChange={handleQuantityChange}
              >
                {[...Array(Math.min(10, stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <AddToCartButton
            productId={productId}
            quantity={quantity}
            stock={stock}
            className={compact ? styles.compactButton : styles.fullButton}
            compact={compact}
          />
        </div>
      )}
    </div>
  );
}
