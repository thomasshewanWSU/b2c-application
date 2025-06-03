"use client";

import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { LoadingSpinner } from "@repo/utils";

type ProductGridProps = {
  products: Array<{
    id: number;
    urlId: string;
    name: string;
    brand?: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    rating?: number;
    reviewCount?: number;
    stock: number;
    featured: boolean;
  }>;
  loading: boolean;
};

/**
 * ProductGrid component displays a grid of products.
 * It shows a loading spinner while products are being fetched,
 * and an empty state message if no products are found.
 *
 * @param {ProductGridProps} props - The properties for the ProductGrid component.
 * @returns {JSX.Element} The rendered product grid component.
 */
export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="medium" message="Loading products..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyStateTitle}>No products found</h3>
        <p className={styles.emptyStateMessage}>
          Try adjusting your filters or search term to find what you're looking
          for.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <div key={product.id} className={styles.productItem}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
