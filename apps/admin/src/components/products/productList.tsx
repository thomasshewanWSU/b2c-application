"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import styles from "./productList.module.css";
import { useProductFilters } from "@repo/utils";

import { Pagination, LoadingSpinner } from "@repo/utils";

import { ProductTableView } from "./ProductTableView";
import { ProductListCard } from "./ProductListCard";
import { ViewToggle } from "./ViewToggle";
export function ProductList() {
  const [viewType, setViewType] = useState<"cards" | "table">("table");

  const {
    products,
    loading,
    filters,
    pagination,
    categories,
    fetchProducts,
    handleFilterChange,
    resetFilters,
    setPage,
    removeFilter,
  } = useProductFilters();

  // Fetch products on initial load
  useEffect(() => {
    document.title = "Products | Admin Dashboard";
  }, []);

  return (
    <div className={styles.dashboardContainer} data-test-id="product-list">
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle} data-test-id="product-title">
          Products
        </h2>
        <ViewToggle viewType={viewType} onViewChange={setViewType} />
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection} data-test-id="filter-section">
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="search" className={styles.filterLabel}>
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              data-test-id="search-input"
              value={filters.search}
              onChange={handleFilterChange}
              className={styles.filterInput}
              placeholder="Search products..."
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="category" className={styles.filterLabel}>
              Category
            </label>
            <select
              id="category"
              name="category"
              data-test-id="category-select"
              value={filters.category}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="minPrice" className={styles.filterLabel}>
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              data-test-id="min-price-input"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className={styles.filterInput}
              placeholder="$0"
              min="0"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="maxPrice" className={styles.filterLabel}>
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              data-test-id="max-price-input"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className={styles.filterInput}
              placeholder="No limit"
              min="0"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="stockStatus" className={styles.filterLabel}>
              Stock Status
            </label>
            <select
              id="stockStatus"
              name="stockStatus"
              data-test-id="stock-status-select"
              value={filters.stockStatus}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">All</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="activeStatus" className={styles.filterLabel}>
              Status
            </label>
            <select
              id="activeStatus"
              name="activeStatus"
              data-test-id="active-status-select"
              value={filters.activeStatus || ""}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sortBy" className={styles.filterLabel}>
              Sort By
            </label>
            <select
              id="sortBy"
              data-test-id="sort-by-select"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="nameAZ">Name: A to Z</option>
              <option value="nameZA">Name: Z to A</option>
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button
            className={`${styles.filterButton} ${styles.filterResetButton}`}
            onClick={resetFilters}
            data-test-id="reset-button"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className={styles.dashboardContent}>
        {loading ? (
          <LoadingSpinner size="small" message="" />
        ) : products.length > 0 ? (
          <>
            {viewType === "cards" ? (
              <ProductListCard
                products={products}
                fetchProducts={fetchProducts}
              />
            ) : (
              <ProductTableView
                products={products}
                fetchProducts={fetchProducts}
              />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.pageSize}
                hasMore={pagination.hasMore}
                onPageChange={setPage}
                itemName="products"
                data-test-id="pagination"
              />
            )}
          </>
        ) : (
          <div className={styles.emptyState} data-test-id="empty-state">
            <div className={styles.emptyStateIcon}>📦</div>
            <h3 className={styles.emptyStateMessage}>No products found</h3>
            <p className={styles.emptyStateDescription}>
              {pagination.total === 0
                ? "You can add a new product by clicking the button below."
                : "Try adjusting your filters to find what you're looking for."}
            </p>
            {pagination.total === 0 && (
              <Link
                href="/products/create"
                className={styles.filterApplyButton}
                style={{ textDecoration: "none", padding: "0.6rem 1.2rem" }}
              >
                Create New Product
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
