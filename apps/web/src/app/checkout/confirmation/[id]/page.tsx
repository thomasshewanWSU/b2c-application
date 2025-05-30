"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./confirmation.module.css";
import { LoadingSpinner, printOrderInvoice } from "@repo/utils";
import { use } from "react";
export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const unwrappedParams = use(params as unknown as Promise<{ id: string }>);

  // Now safely access the ID from unwrapped params
  const orderId = parseInt(unwrappedParams.id, 10);
  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrderDetails(data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Could not load order details");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handlePrintInvoice = () => {
    if (orderDetails) {
      printOrderInvoice(orderDetails);
    }
  };
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading order confirmation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <Link href="/" className={styles.button}>
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.confirmationPage}>
      <div className={styles.confirmationCard}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <svg
              className={styles.checkIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className={styles.title}>Order Confirmed</h1>
          <p className={styles.subtitle}>
            Thank you for your purchase. Your order has been received and is now
            being processed.
          </p>
        </div>

        <div className={styles.orderDetails}>
          <h2 className={styles.sectionTitle}>Order Details</h2>

          <div className={styles.orderInfo}>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Order Number:</span>
              <span className={styles.infoValue}>#{orderDetails.id}</span>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Date:</span>
              <span className={styles.infoValue}>
                {formatDate(orderDetails.createdAt)}
              </span>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Status:</span>
              <span
                className={`${styles.infoValue} ${styles.statusBadge} ${styles[`status${orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}`]}`}
              >
                {orderDetails.status}
              </span>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Payment Method:</span>
              <span className={styles.infoValue}>
                {orderDetails.paymentMethod}
              </span>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Total:</span>
              <span className={`${styles.infoValue} ${styles.totalValue}`}>
                {formatPrice(orderDetails.total)}
              </span>
            </div>
          </div>

          <div className={styles.shippingAddress}>
            <h3 className={styles.subsectionTitle}>Shipping Address</h3>
            <p className={styles.addressText}>
              {orderDetails.shippingAddress.split(", ").join(", ")}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handlePrintInvoice} className={styles.printButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Invoice
          </button>
          <Link href="/" className={styles.homeButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
