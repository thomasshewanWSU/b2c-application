"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FilterSidebar } from "./FilterSidebar";
import { ProductGrid } from "./ProductGrid";
import { useProductFilters } from "@repo/utils";
import { Pagination } from "@repo/utils";
import styles from "./ProductsContainer.module.css";

type ProductsContainerProps = {
  initialSearchParams: { [key: string]: string | string[] | undefined };
};

export function ProductsContainer({
  initialSearchParams,
}: ProductsContainerProps) {
  // Use the shared filters hook

  const {
    products,
    loading,
    filters,
    pagination,
    categories,
    brands,
    priceRange,
    handleFilterChange,
    resetFilters,
    setPage,
    removeFilter,
  } = useProductFilters({
    apiEndpoint: "/api/products/search",
    initialFilters: initialSearchParams,
    defaultPageSize: 24,
    defaultSortBy: "featured",
  });

  // Handle the results title based on filters
  const getResultsTitle = () => {
    if (filters.search) {
      return `Results for "${filters.search}"`;
    }

    if (filters.category) {
      return filters.category;
    }

    return "All Products";
  };

  return (
    <div className={styles.productsLayout}>
      <FilterSidebar
        filters={filters}
        categories={categories}
        priceRange={priceRange}
        brands={brands}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onRemoveFilter={removeFilter}
      />

      <div className={styles.mainContent}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>
            {getResultsTitle()}
            {pagination.total > 0 && (
              <span className={styles.resultsCount}>
                ({pagination.total} products)
              </span>
            )}
          </h2>
          <div className={styles.sortControls}>
            <label htmlFor="sortBy" className={styles.sortLabel}>
              Sort by:
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange(e)}
              className={styles.sortSelect}
            >
              <option value="featured">Featured</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="bestSelling">Best Selling</option>
            </select>
          </div>
        </div>

        <ProductGrid products={products} loading={loading} />

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
      </div>
    </div>
  );
}
