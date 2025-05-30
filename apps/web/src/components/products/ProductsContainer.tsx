"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterSidebar } from "./FilterSidebar";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "@repo/utils";
import styles from "./ProductsContainer.module.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type ProductsContainerProps = {
  initialSearchParams: { [key: string]: string | string[] | undefined };
};

export function ProductsContainer({
  initialSearchParams,
}: ProductsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = {
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "featured",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    brand: searchParams.get("brand") || "",
    stockStatus: searchParams.get("stockStatus") || "",
  };
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = 24;

  // Fetch products with TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", filters, currentPage, pageSize],
    queryFn: async () => {
      const filtered = Object.fromEntries(
        Object.entries({
          ...filters,
          page: currentPage.toString(),
          limit: pageSize.toString(),
        }).filter(([_, v]) => v !== "" && v !== undefined),
      );
      const params = new URLSearchParams(filtered);
      const res = await fetch(`/api/products/search?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const products = data?.products || [];
  const pagination = data?.pagination ?? {
    totalPages: 1,
    currentPage: 1,
    total: 0,
    pageSize,
    hasMore: false,
  };
  const categories = data?.categories || [];
  const brands = data?.brands || [];
  const priceRange = data?.priceRange ?? { min: 0, max: 1000 };
  // Handlers
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Always reset to page 1 on filter change
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const handleQuickPriceChange = (min: number, max: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("minPrice", min.toString());
    params.set("maxPrice", max.toString());
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const resetFilters = () => {
    const params = new URLSearchParams();
    params.set("sortBy", "featured");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete(key);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Results title
  const getResultsTitle = () => {
    if (filters.search) return `Results for "${filters.search}"`;
    if (filters.category) return filters.category;
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
        onQuickPriceChange={handleQuickPriceChange}
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
              onChange={handleFilterChange}
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

        <ProductGrid products={products} loading={isLoading} />

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            hasMore={pagination.hasMore}
            onPageChange={handlePageChange}
            itemName="products"
          />
        )}
      </div>
    </div>
  );
}
