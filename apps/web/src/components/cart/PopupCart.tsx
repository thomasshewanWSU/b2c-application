"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@repo/utils";
import styles from "./PopupCart.module.css";
import { QuantityToggle } from "./QuantityToggle";
import { useQuery } from "@tanstack/react-query";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock: number;
};

type PopupCartProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * PopupCart component displays a popup cart with items added to the cart.
 * It fetches cart data from the server and allows users to view, update,
 * or remove items from their cart.
 *
 * @param {PopupCartProps} props - The properties for the popup cart.
 * @returns {JSX.Element | null} The rendered popup cart component or null if closed.
 */
export function PopupCart({ isOpen, onClose }: PopupCartProps) {
  const cartRef = useRef<HTMLDivElement>(null);
  const lastFetchedVersionRef = useRef<number | null>(null); // Move ref here

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling on the body when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
    enabled: isOpen, // Only fetch when popup is open
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const cartItems: CartItem[] = data?.items || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isCartEmpty = cartItems.length === 0;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.popupCart} ref={cartRef}>
        <div className={styles.header}>
          <h3 className={styles.title}>Cart ({cartCount})</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.cartContent}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
          ) : error ? (
            <div className={styles.error}>
              {error instanceof Error ? error.message : "An error occurred"}
            </div>
          ) : isCartEmpty || cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Your cart is empty</p>
              <button onClick={onClose} className={styles.continueShopping}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className={styles.itemsContainer}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      <Link href={`/products/${item.slug}`} onClick={onClose}>
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className={styles.image}
                        />
                      </Link>
                    </div>
                    <div className={styles.itemDetails}>
                      <Link
                        href={`/products/${item.slug}`}
                        className={styles.itemName}
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                      <div className={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className={styles.quantityWrap}>
                      <QuantityToggle
                        productId={item.id}
                        initialQuantity={item.quantity}
                        maxQuantity={item.stock}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <div className={styles.subtotal}>
                  <span>Subtotal:</span>
                  <span className={styles.subtotalPrice}>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Link
                  href="/cart"
                  className={styles.viewCartButton}
                  onClick={onClose}
                  data-test-id="cart-link"
                >
                  Go to Cart
                </Link>
                <Link
                  href="/checkout"
                  className={styles.checkoutButton}
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
