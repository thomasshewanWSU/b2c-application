"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./orders.module.css";
import {
  formatPrice,
  formatDate,
  LoadingSpinner,
  Pagination,
  StatusBadge,
} from "@repo/utils";

type Order = {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    productName: string;
    productImage: string | null;
  }>;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  total: number;
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Fetch orders when component mounts or page changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders(pagination.currentPage);
    }
  }, [status, pagination.currentPage]);

  // Function to fetch orders with pagination
  const fetchOrders = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?page=${page}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  if (
    status === "loading" ||
    (status === "authenticated" && loading && orders.length === 0)
  ) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading your orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => fetchOrders(1)} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Your Orders</h1>
        <p className={styles.orderCount}>
          Showing {orders.length} of {pagination.total} orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
          <h2 className={styles.emptyStateTitle}>No orders yet</h2>
          <p className={styles.emptyStateText}>
            You haven't placed any orders yet. Start shopping to see your orders
            here.
          </p>
          <Link href="/products" className={styles.shopButton}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderMetadata}>
                    <div className={styles.orderNumber}>Order #{order.id}</div>
                    <div className={styles.orderDate}>
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className={styles.orderStatus}>
                    <StatusBadge orderStatus={order.status} variant="pill" />
                  </div>
                </div>

                <div className={styles.orderItemsPreviews}>
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className={styles.itemPreview}>
                      <div className={styles.itemImageContainer}>
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={60}
                            height={60}
                            className={styles.itemImage}
                          />
                        ) : (
                          <div className={styles.placeholderImage} />
                        )}
                      </div>
                      <div className={styles.itemQuantity}>
                        ×{item.quantity}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className={styles.moreItems}>
                      +{order.items.length - 3} more
                    </div>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    Total:{" "}
                    <span className={styles.totalValue}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className={styles.viewDetailsButton}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={Math.ceil(pagination.total / pagination.totalPages)}
                hasMore={pagination.currentPage < pagination.totalPages}
                onPageChange={handlePageChange}
                itemName="orders"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
