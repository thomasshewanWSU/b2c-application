import styles from "./productForm.module.css";
import Image from "next/image";

// Define the type for the product
type ProductData = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  id?: number;
};
const isValidUrl = (url: string) => {
  try {
    // Only try to validate if it's a non-empty string that looks like a URL
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      new URL(url);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const ProductCardPreview = ({ product }: { product: ProductData }) => {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewCardImageContainer}>
        <Image
          src={
            isValidUrl(product.imageUrl)
              ? product.imageUrl
              : "/placeholder-image.jpg"
          }
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          style={{ objectFit: "cover" }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = "/placeholder-image.jpg";
          }}
        />
      </div>
      <div className={styles.previewCardContent}>
        <h3 className={styles.previewCardTitle}>
          {product.name || "Product Name"}
        </h3>
        <p className={styles.previewCardPrice}>
          ${Number(product.price).toFixed(2)}
        </p>
        <div className={styles.previewCardCategory}>{product.category}</div>
      </div>
    </div>
  );
};
// Product detail preview component (for product page)
export const ProductDetailPreview = ({ product }: { product: ProductData }) => {
  return (
    <div className={styles.previewDetail}>
      <div className={styles.previewDetailHeader}>
        <h2 className={styles.previewDetailTitle}>
          {product.name || "Product Name"}
        </h2>
        <div className={styles.previewDetailCategory}>{product.category}</div>
      </div>

      <div className={styles.previewDetailLayout}>
        <div className={styles.previewDetailImageContainer}>
          <Image
            src={
              isValidUrl(product.imageUrl)
                ? product.imageUrl
                : "/placeholder-image.jpg"
            }
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            style={{ objectFit: "cover" }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
          />
        </div>

        <div className={styles.previewDetailInfo}>
          <div className={styles.previewDetailPrice}>
            ${Number(product.price).toFixed(2)}
          </div>

          <div className={styles.previewDetailStock}>
            <span className={styles.previewDetailLabel}>Availability: </span>
            {product.stock > 0 ? (
              <span className={styles.previewDetailInStock}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                In Stock ({product.stock})
              </span>
            ) : (
              <span className={styles.previewDetailOutOfStock}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
                Out of Stock
              </span>
            )}
          </div>

          <div className={styles.previewDetailDescription}>
            <h3 className={styles.previewDetailSectionTitle}>Description</h3>
            <p>{product.description || "No description available."}</p>
          </div>

          <div className={styles.previewDetailActions}>
            <button className={styles.previewDetailAddToCart}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              Add to Cart
            </button>
            <button className={styles.previewDetailBuyNow}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9 1c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-3.5-5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5-3.5 1.57-3.5 3.5zm17.5 10c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v2h18v-2z" />
              </svg>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
