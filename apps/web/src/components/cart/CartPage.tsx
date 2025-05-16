"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@repo/utils";
import styles from "./cart.module.css";
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

export function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justAdded = searchParams.get("added");
  const stockIssues = searchParams.get("stockIssues");

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart");
      const result = await response.json();

      return result;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const cartItems = data?.items || [];

  const subtotal: number = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
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
      {stockIssues && (
        <div className={styles.stockWarning}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={styles.warningIcon}
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <p>Some items in your cart have stock changes.</p>
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
                {cartItems.map((item: CartItem) => (
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
