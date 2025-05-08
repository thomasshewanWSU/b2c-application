"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage, formatPrice } from "@repo/utils";
import styles from "./ProductCard.module.css";
//import { StarRating } from "../common/StarRating";

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
  const [isHovering, setIsHovering] = useState(false);
  const brand = product.brand || product.category;

  return (
    <div
      className={styles.productCard}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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

      <button
        className={`${styles.addToCartButton} ${isHovering ? styles.visible : ""}`}
        onClick={(e) => {
          e.preventDefault();
          // Add to cart functionality here
          console.log(`Added ${product.name} to cart`);
        }}
      >
        Add to Cart
      </button>

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
