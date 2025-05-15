"use client";

import Link from "next/link";
import { ProductImage, formatPrice } from "@repo/utils";
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
    <div className={styles.productCard}>
      <Link href={`/products/${product.urlId}`} className={styles.productLink}>
        <div className={styles.imageContainer}>
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className={styles.productImage}
            priority={false}
            fill={false}
            width={200}
            height={200}
            key={product.imageUrl}
          />
        </div>

        <div className={styles.productInfo}>
          <div className={styles.brandName}>{brand}</div>
          <h3 className={styles.productName}>{product.name}</h3>
          {product.rating !== undefined &&
            product.reviewCount !== undefined && (
              <div className={styles.ratings}>
                {/*<StarRating rating={product.rating} />*/}
                <span className={styles.reviewCount}>
                  {product.reviewCount}
                </span>
              </div>
            )}
          <div className={styles.productPrice}>
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>
      <div className={styles.controlsContainer}>
        <QuantityControls
          productId={product.id}
          stock={product.stock}
          compact={true}
          defaultQuantity={cartItem?.quantity || 1}
          showQuantitySelector={!!cartItem}
        />
      </div>

      {product.stock < 10 && product.stock > 0 && (
        <div className={styles.lowStockBadge}>
          Only {product.stock} left in stock
        </div>
      )}

      {product.stock === 0 && (
        <div className={styles.outOfStockBadge}>Out of stock</div>
      )}
    </div>
  );
}
