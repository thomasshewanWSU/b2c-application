"use client";

import Link from "next/link";
import { ProductImage, formatPrice, StatusBadge } from "@repo/utils";
import styles from "./ProductCard.module.css";
import { QuantityControls } from "../cart/QuantityControls";
import { useQuery } from "@tanstack/react-query";

type ProductCardProps = {
  product: {
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
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const brand = product.brand || product.category;

  // Fetch cart data using TanStack Query
  const { data } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const cartItems = data?.items || [];
  const cartItem = cartItems.find((item: any) => item.id === product.id);

  return (
    <div className={styles.productCard} data-test-id="product-card">
      <Link
        href={`/products/${product.urlId}`}
        className={styles.productLink}
        data-test-id="product-link"
      >
        <div className={styles.imageContainer} data-test-id="image-container">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className={styles.productImage}
            priority={false}
            fill={false}
            width={200}
            height={200}
            key={product.imageUrl}
            data-test-id="product-image"
          />
        </div>
        <StatusBadge
          stock={product.stock}
          className={styles.badgeCorner}
          data-test-id="status-badge"
        />

        <div className={styles.productInfo} data-test-id="product-info">
          <div className={styles.brandName} data-test-id="product-brand">
            {brand}
          </div>
          <h3 className={styles.productName} data-test-id="product-name">
            {product.name}
          </h3>
          {product.rating !== undefined &&
            product.reviewCount !== undefined && (
              <div className={styles.ratings} data-test-id="product-ratings">
                {/*<StarRating rating={product.rating} />*/}
                <span
                  className={styles.reviewCount}
                  data-test-id="product-review-count"
                >
                  {product.reviewCount}
                </span>
              </div>
            )}
          <div className={styles.productPrice} data-test-id="product-price">
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>
      <div className={styles.controlsContainer} data-test-id="product-controls">
        <QuantityControls
          productId={product.id}
          stock={product.stock}
          compact={true}
          defaultQuantity={cartItem?.quantity || 1}
          showQuantitySelector={!!cartItem}
          data-test-id="quantity-controls"
        />
      </div>
    </div>
  );
}
