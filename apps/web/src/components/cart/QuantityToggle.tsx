"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./QuantityToggle.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  const [generalError, setGeneralError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      const res = await fetch("/api/cart", {
        method: newQuantity === 0 ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (onQuantityChange) onQuantityChange(quantity);
    },
    onError: (error: any) => {
      setGeneralError(error.message || "Error updating cart");
      setTimeout(() => setGeneralError(null), 3000);
    },
  });
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

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > maxQuantity) {
      if (newQuantity > maxQuantity) handleMaxQuantityClick();
      return;
    }
    setIsUpdating(true);
    setQuantity(newQuantity); // Optimistic UI
    updateQuantityMutation.mutate(newQuantity, {
      onSettled: () => setIsUpdating(false),
    });
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
