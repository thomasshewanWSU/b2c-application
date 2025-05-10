"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@repo/utils";
import styles from "./cart.module.css";
import { useCartContext } from "@/components/cart/CartProvider";
import { QuantityToggle } from "./QuantityToggle";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock: number;
};

export function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justAdded = searchParams.get("added");
  const { cartVersion, cartItems: contextCartItems } = useCartContext();

  // Fetch cart data
  useEffect(() => {
    async function fetchCart() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCart();
  }, [cartVersion]);

  // Listen for deletion events from context
  useEffect(() => {
    if (cartItems.length === 0 || !contextCartItems) return;

    // Check if any items were removed in context but still exist in our local state
    const hasRemovedItems = cartItems.some(
      (item) =>
        !contextCartItems.some((contextItem) => contextItem.id === item.id),
    );

    if (hasRemovedItems) {
      // Update our items to match context (remove deleted items)
      const updatedItems = cartItems.filter((item) =>
        contextCartItems.some((contextItem) => contextItem.id === item.id),
      );

      // Apply quantity updates from context while keeping other item details
      const syncedItems = updatedItems.map((item) => {
        const contextItem = contextCartItems.find((ci) => ci.id === item.id);
        return contextItem ? { ...item, quantity: contextItem.quantity } : item;
      });

      setCartItems(syncedItems);
    }
  }, [contextCartItems, cartItems]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>

      {justAdded && (
        <div className={styles.notification}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={styles.notificationIcon}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <p>Item was successfully added to your cart!</p>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.emptyCartIcon}
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className={styles.continueShopping}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.cartTable}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeadCell}>Product</th>
                  <th className={styles.tableHeadCell}>Price</th>
                  <th className={styles.tableHeadCell}>Quantity</th>
                  <th className={styles.tableHeadCell}>Total</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {cartItems.map((item) => (
                  <tr key={item.id} className={styles.tableBodyRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.productCell}>
                        <div className={styles.productImage}>
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className={styles.thumbnail}
                          />
                        </div>
                        <div className={styles.productInfo}>
                          <Link
                            href={`/products/${item.slug}`}
                            className={styles.productName}
                          >
                            {item.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.price}>
                        {formatPrice(item.price)}
                      </div>
                    </td>

                    <td className={styles.tableCell}>
                      <div className={styles.quantityControlsWrapper}>
                        <QuantityToggle
                          productId={item.id}
                          initialQuantity={item.quantity}
                          maxQuantity={item.stock || 100} // Fallback if stock isn't provided
                        />
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.totalPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span className={styles.summaryPrice}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span className={styles.summaryPrice}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className={styles.checkoutButton}
            >
              Proceed to Checkout
            </button>
            <Link href="/products" className={styles.continueShopping}>
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
