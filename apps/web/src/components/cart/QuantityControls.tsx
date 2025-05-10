"use client";

import { useState, useEffect } from "react";
import styles from "./QuantityControls.module.css";
import { QuantityToggle } from "./QuantityToggle";
import { AddToCartButton } from "./AddToCartButton";
import { useCartContext } from "@/components/cart/CartProvider";

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
  const { cartVersion, cartItems } = useCartContext();
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  // Check if item is in cart - use cartItems from context

  // Check if item is in cart
  useEffect(() => {
    setCheckingCart(true);
    // Find item in context instead of fetching
    const cartItem = cartItems.find((item) => item.id === productId);
    const cartQuantity = cartItem ? cartItem.quantity : null;

    setInCart(cartQuantity);

    if (onCartStatusChange) {
      onCartStatusChange(cartQuantity);
    }

    // Use a small timeout to ensure we don't flash states
    const timer = setTimeout(() => {
      setCheckingCart(false);
      setInitialCheckComplete(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [productId, cartItems, onCartStatusChange]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  // Don't render anything while checking cart status
  if (!initialCheckComplete) {
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
