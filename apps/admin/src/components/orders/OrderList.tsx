"use client";

import { useEffect } from "react";
import styles from "./orderList.module.css";
import { useOrderFilters } from "../../hooks/useOrderFilters";
import { OrderListFilters } from "./OrderListFilters";
import { OrderTable } from "./OrderTable";
import { LoadingSpinner, Pagination, StatusBadge } from "@repo/utils";

/**
 * OrderList component displays a list of orders with filtering and pagination.
 * It uses the useOrderFilters hook to manage state and fetch data.
 * The component includes a header, filter section, and order table.
 */
export function OrderList() {
  const {
    orders,
    loading,
    filters,
    pagination,
    statuses,
    handleFilterChange,
    resetFilters,
    setPage,
    removeFilter,
  } = useOrderFilters();

  useEffect(() => {
    document.title = "Orders | Admin Dashboard";
  }, []);

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Orders</h2>
      </div>

      {/* Filter Section */}
      <OrderListFilters
        filters={filters}
        statuses={statuses}
        handleFilterChange={handleFilterChange}
        resetFilters={resetFilters}
        removeFilter={removeFilter}
      />

      {/* Order List */}
      <div className={styles.dashboardContent}>
        {loading ? (
          <LoadingSpinner size="small" message="" />
        ) : orders.length > 0 ? (
          <>
            <OrderTable orders={orders} formatDate={formatDate} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.pageSize}
                hasMore={pagination.hasMore}
                onPageChange={setPage}
                itemName="orders"
              />
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🛒</div>
            <h3 className={styles.emptyStateMessage}>No orders found</h3>
            <p className={styles.emptyStateDescription}>
              {pagination.total === 0
                ? "There are no orders in the system yet."
                : "Try adjusting your filters to find what you're looking for."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
