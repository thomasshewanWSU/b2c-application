"use client";

import { ProductImage, formatPrice, StarRating } from "@repo/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import styles from "./ProductDetailView.module.css";
import { Product } from "@repo/db/data";
import ReactMarkdown from "react-markdown";
import { QuantityControls } from "../cart/QuantityControls";
type ProductDetailViewProps = {
  product: Product;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const brand = product.brand || product.category;
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock < 10;

  return (
    <div className={styles.container}>
      <div className={styles.productLayout}>
        {/* Left column: Product image */}
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImage}
              fill={true}
              sizes="(max-width: 768px) 100vw, 500px"
              priority={true}
            />
          </div>
        </div>

        {/* Right column: Product info */}
        <div className={styles.infoColumn}>
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Brand */}
          <div className={styles.brandRow}>
            <span className={styles.brandLabel}>Brand: </span>
            <span className={styles.brandValue}>{brand}</span>
          </div>

          {/* Ratings */}
          {product.rating !== undefined && (
            <div className={styles.ratingsRow}>
              <StarRating rating={product.rating} />
              <span className={styles.reviewCount}>
                {product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}

          {/* Price */}
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Price: </span>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>

          {/* Availability */}
          <div className={styles.availabilityRow}>
            <span
              className={`${styles.stockStatus} ${
                inStock
                  ? lowStock
                    ? styles.lowStock
                    : styles.inStock
                  : styles.outOfStock
              }`}
            >
              {inStock
                ? lowStock
                  ? `Only ${product.stock} left in stock - order soon`
                  : "In Stock"
                : "Out of Stock"}
            </span>
          </div>

          {/* Action buttons */}
          <div className={styles.actionButtons}>
            <QuantityControls
              productId={product.id}
              stock={product.stock}
              showQuantitySelector={true}
              defaultQuantity={1}
              className={styles.detailControls}
            />
          </div>
          {/* About this item section */}
          <div className={styles.aboutSection}>
            <h2 className={styles.sectionTitle}>About this item</h2>
            <div className={styles.productDescription}>
              <ReactMarkdown>{product.description}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for additional information */}
      <div className={styles.additionalInfo}>
        <Tabs defaultValue="details">
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className={styles.tabContent}>
            <div className={styles.detailsSection}>
              {product.detailedDescription ? (
                <ReactMarkdown>{product.detailedDescription}</ReactMarkdown>
              ) : (
                <>
                  <h3>Product Description</h3>
                  <ReactMarkdown>{product.description}</ReactMarkdown>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className={styles.tabContent}>
            <div className={styles.specificationsTable}>
              <h3>Technical Specifications</h3>
              <table>
                <body>
                  {Object.entries(product.specifications || {}).map(
                    ([key, value]) => (
                      <tr key={key}>
                        <td className={styles.specKey}>{key}</td>
                        <td className={styles.specValue}>{String(value)}</td>
                      </tr>
                    ),
                  )}
                </body>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className={styles.tabContent}>
            <div className={styles.reviewsSection}>
              <h3>Customer Reviews</h3>
              {product.reviews && product.reviews.length > 0 ? (
                <div className={styles.reviewsList}>
                  {product.reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <StarRating rating={review.rating} size="small" />
                        <span className={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className={styles.reviewTitle}>{review.title}</h4>
                      )}
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noReviews}>
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
