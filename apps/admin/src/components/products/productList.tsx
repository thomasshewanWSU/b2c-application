"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./productList.module.css";
import { DeleteProductButton } from "../../utils/deleteProduct";
import { useProductFilters } from "@repo/utils/";
import {
  formatPrice,
  getStockStatusClass,
  getStockStatusText,
  ProductImage,
} from "@repo/utils/";
import { Pagination, LoadingSpinner } from "@repo/utils/";

export function ProductList() {
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
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Products</h2>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="search" className={styles.filterLabel}>
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
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
            <label htmlFor="sortBy" className={styles.filterLabel}>
              Sort By
            </label>
            <select
              id="sortBy"
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
            <div className={styles.productList}>
              {products.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productImageContainer}>
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      className={styles.productImage}
                    />
                    <span
                      className={`${styles.statusBadge} ${getStockStatusClass(product.stock)}`}
                    >
                      {getStockStatusText(product.stock)}
                    </span>
                  </div>

                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productCategory}>
                      {product.category}
                    </div>
                    <div className={styles.productPrice}>
                      {formatPrice(product.price)}
                    </div>

                    <div className={styles.productMeta}>
                      <div className={styles.stockInfo}>
                        <span>Stock: {product.stock}</span>
                      </div>
                      <div>ID: {product.id.toString().slice(0, 8)}</div>
                    </div>
                    <div className={styles.productActions}>
                      <Link
                        href={`/products/${product.id}`}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                      >
                        <svg
                          className={styles.actionIcon}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        View
                      </Link>

                      <Link
                        href={`/products/${product.id}/edit`}
                        className={`${styles.actionButton} ${styles.editButton}`}
                      >
                        <svg
                          className={styles.actionIcon}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </Link>

                      <DeleteProductButton
                        productId={product.id}
                        variant="icon"
                        buttonClassName={`${styles.actionButton} ${styles.deleteButton}`}
                        onSuccess={() => {
                          // Refresh the product list after deletion
                          fetchProducts();
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
              />
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
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
