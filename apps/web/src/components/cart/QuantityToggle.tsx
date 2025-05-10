"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./QuantityToggle.module.css";
import { useCartContext } from "@/components/cart/CartProvider";

type QuantityToggleProps = {
  productId: number;
  initialQuantity: number;
  maxQuantity: number;
  onQuantityChange?: (newQuantity: number) => void; // Optional callback for parent components
};

export function QuantityToggle({
  productId,
  initialQuantity,
  maxQuantity,
  onQuantityChange,
}: QuantityToggleProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMaxTooltip, setShowMaxTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { refreshCart, updateCartItemLocally, removeCartItemLocally } =
    useCartContext();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Update local state if prop changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const updateQuantity = async (newQuantity: number) => {
    // Special case for deletion
    if (newQuantity === 0) {
      setIsUpdating(true);

      // Optimistic UI update
      removeCartItemLocally(productId);
      if (onQuantityChange) onQuantityChange(0);

      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          // Only refresh cart if there was an error (to revert)
          refreshCart();

          // Show error
          try {
            const data = await response.json();
            setGeneralError(data.message || "Error removing item");
            setTimeout(() => setGeneralError(null), 3000);
          } catch (e) {
            setGeneralError("Failed to remove item");
            setTimeout(() => setGeneralError(null), 3000);
          }
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        refreshCart(); // Refresh to revert optimistic update
        setGeneralError("Network error while removing item");
        setTimeout(() => setGeneralError(null), 3000);
      } finally {
        setIsUpdating(false);
      }
      return; // Return here after delete is handled
    }

    // Normal quantity update - check range
    if (newQuantity < 1 || newQuantity > maxQuantity) {
      if (newQuantity > maxQuantity) handleMaxQuantityClick();
      return;
    }

    setIsUpdating(true);

    // Optimistic UI update
    setQuantity(newQuantity);
    updateCartItemLocally(productId, newQuantity);
    if (onQuantityChange) onQuantityChange(newQuantity);

    try {
      // Actually make the API call for quantity updates
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (!response.ok) {
        // Revert optimistic update
        refreshCart();

        // Show error
        try {
          const data = await response.json();

          // Show max quantity tooltip if that's the error
          if (data.message?.includes("Max Quantity")) {
            handleMaxQuantityClick();
          }
          // Handle other error types
          else {
            setGeneralError(data.message || "Error updating cart");
            setTimeout(() => setGeneralError(null), 3000);
          }
        } catch (e) {
          setGeneralError("Failed to update item");
          setTimeout(() => setGeneralError(null), 3000);
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      refreshCart(); // Refresh to revert optimistic update
      setGeneralError("Network error while updating");
      setTimeout(() => setGeneralError(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = () => updateQuantity(0);

  const handleMaxQuantityClick = () => {
    // Show tooltip when clicking on disabled button
    if (quantity >= maxQuantity) {
      setShowMaxTooltip(true);

      // Hide after 2 seconds
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      tooltipTimeoutRef.current = setTimeout(() => {
        setShowMaxTooltip(false);
      }, 2000);
    }
  };

  // The rest of your component remains the same...

  // Standard version for cart and product detail
  return (
    <div className={styles.quantityToggle}>
      {quantity === 1 ? (
        <button
          onClick={removeItem}
          className={`${styles.toggleButton} ${styles.removeButton}`}
          disabled={isUpdating}
          aria-label="Remove from cart"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 3.5H13M4 1H10M4.5 6V10M9.5 6V10M1.5 3.5L2 12.5C2 13.05 2.45 13.5 3 13.5H11C11.55 13.5 12 13.05 12 12.5L12.5 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => updateQuantity(quantity - 1)}
          className={styles.toggleButton}
          disabled={isUpdating}
          aria-label="Decrease quantity"
        >
          <svg
            width="10"
            height="2"
            viewBox="0 0 10 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <span className={styles.quantity}>{isUpdating ? "..." : quantity}</span>

      <div className={styles.plusButtonContainer}>
        <button
          onClick={() =>
            quantity < maxQuantity
              ? updateQuantity(quantity + 1)
              : handleMaxQuantityClick()
          }
          className={styles.toggleButton}
          disabled={isUpdating}
          aria-label="Increase quantity"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 1V9M1 5H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {showMaxTooltip && quantity >= maxQuantity && (
          <div className={styles.maxTooltip}>Max Qty Reached</div>
        )}
      </div>
      {generalError && (
        <div className={styles.errorMessage}>{generalError}</div>
      )}
    </div>
  );
}
