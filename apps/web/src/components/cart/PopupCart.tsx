"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@repo/utils";
import styles from "./PopupCart.module.css";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/components/cart/CartProvider";
import { QuantityToggle } from "./QuantityToggle";
import { useErrorMessage } from "../../hooks/useErrorMessage";

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

export function PopupCart({ isOpen, onClose }: PopupCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0); // Move subtotal into state
  const { error, showError } = useErrorMessage();
  const cartRef = useRef<HTMLDivElement>(null);
  const lastFetchedVersionRef = useRef<number | null>(null); // Move ref here
  const {
    cartVersion,
    cartCount,
    isCartEmpty,
    cartItems: contextCartItems,
  } = useCartContext();

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

  // Fetch cart data when cart changes
  useEffect(() => {
    if (!isOpen) return;

    // Skip API call if cartVersion hasn't changed since last fetch
    if (lastFetchedVersionRef.current === cartVersion) {
      // Immediately set loading to false if we're skipping the fetch
      setIsLoading(false);
      return;
    }

    async function fetchCart() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          const items = data.items || [];
          setCartItems(items);

          // Calculate initial subtotal after fetching cart items
          const initialSubtotal: number = items.reduce(
            (sum: number, item: CartItem): number =>
              sum + item.price * item.quantity,
            0,
          );
          setSubtotal(initialSubtotal);

          // Update the last fetched version
          lastFetchedVersionRef.current = cartVersion;
        } else {
          showError("Failed to load cart");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        showError("Failed to load cart");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCart();
  }, [cartVersion, isOpen, showError]);

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

  useEffect(() => {
    // Only run when contextCartItems changes or when initial cart items are loaded
    // Skip if cartItems is empty (not loaded yet)
    if (cartItems.length === 0 || !contextCartItems.length) return;

    // For each item in our cart, check if quantities match with context
    let needsUpdate = false;
    let updatedSubtotal = 0;

    const updatedItems = cartItems
      .map((item) => {
        const contextItem = contextCartItems.find((ci) => ci.id === item.id);
        // If found in context and quantity differs, update it
        if (contextItem && contextItem.quantity !== item.quantity) {
          needsUpdate = true;
          updatedSubtotal += contextItem.quantity * item.price;
          return { ...item, quantity: contextItem.quantity };
        }
        // Otherwise keep item as is
        updatedSubtotal += item.quantity * item.price;
        return item;
      })
      .filter((item) => {
        // Check if any items need to be removed (not in context anymore)
        const stillExists = contextCartItems.some((ci) => ci.id === item.id);
        if (!stillExists) needsUpdate = true;
        return stillExists;
      });

    // Only update state if something changed
    if (needsUpdate) {
      setCartItems(updatedItems);
      setSubtotal(updatedSubtotal);
    } else {
      // Just update subtotal calculation
      setSubtotal(updatedSubtotal);
    }

    // Only depend on contextCartItems, not cartItems
  }, [contextCartItems]);

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
            <div className={styles.error}>{error}</div>
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
