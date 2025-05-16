"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./orderDetails.module.css";
import {
  formatPrice,
  formatDate,
  LoadingSpinner,
  printOrderInvoice,
} from "@repo/utils";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const orderId = parseInt(params.id, 10);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        `/login?returnUrl=${encodeURIComponent(`/orders/${orderId}`)}`,
      );
    }
  }, [status, router, orderId]);

  // Fetch order when component mounts
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrder();
    }
  }, [status]);

  // Function to fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    if (order) {
      printOrderInvoice(order);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading order details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchOrder} className={styles.retryButton}>
          Try Again
        </button>
        <Link href="/orders" className={styles.backButton}>
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorContainer}>
        <h2>Order not found</h2>
        <p>
          The order you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Link href="/orders" className={styles.backButton}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shippingCost = order.total - subtotal;

  return (
    <div className={styles.orderDetailPage}>
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumbs}>
          <Link href="/orders" className={styles.breadcrumbLink}>
            Orders
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span>Order #{order.id}</span>
        </div>
        <button onClick={handlePrintInvoice} className={styles.printButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
      </div>

      <div className={styles.orderSummary}>
        <div className={styles.orderHeader}>
          <h1 className={styles.orderTitle}>Order #{order.id}</h1>
          <span>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className={styles.orderMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Order Date:</span>
            <span className={styles.metaValue}>
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Payment Method:</span>
            <span className={styles.metaValue}>{order.paymentMethod}</span>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <div className={styles.orderSection}>
            <h2 className={styles.sectionTitle}>Order Items</h2>
            <div className={styles.orderItems}>
              {order.items.map((item: any) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.productImage}>
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{item.productName}</h3>
                    <div className={styles.productMeta}>
                      <span className={styles.productPrice}>
                        {formatPrice(item.price)}
                      </span>
                      <span className={styles.productQuantity}>
                        × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.orderSection}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.summaryTable}>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className={styles.orderSection}>
            <h2 className={styles.sectionTitle}>Shipping Address</h2>
            <p className={styles.address}>
              {order.shippingAddress.split(", ").join("\n")}
            </p>
          </div>

          {order.billingAddress && (
            <div className={styles.orderSection}>
              <h2 className={styles.sectionTitle}>Billing Address</h2>
              <p className={styles.address}>
                {order.billingAddress.split(", ").join("\n")}
              </p>
            </div>
          )}

          <div className={styles.actions}>
            <Link href="/orders" className={styles.backToOrdersButton}>
              Back to Orders
            </Link>
            <Link href="/products" className={styles.continueShoppingButton}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
