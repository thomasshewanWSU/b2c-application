import { ProductDetailView } from "@repo/utils";
import styles from "./adminProductPreview.module.css";

type ProductPreviewProps = {
  product: {
    id?: number;
    name: string;
    brand: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category: string;
    specifications: string;
    detailedDescription: string;
  };
  onClose: () => void;
};

export function AdminProductPreview({ product, onClose }: ProductPreviewProps) {
  // Ensure product has all required properties for the shared component
  const enhancedProduct = {
    ...product,
    id: product.id || 0, // Provide default id if not available
    urlId: product.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "preview",
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>Product Detail Preview</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
            Exit Preview
          </button>
        </div>

        <div className={styles.scrollableContent}>
          <ProductDetailView
            product={enhancedProduct}
            isPreview={true}
            showTabs={true}
            showReviews={false}
            actions={
              <div className={styles.addToCartContainer}>
                {/* Preview of what error messages would look like */}
                <div className={`${styles.errorMessage} ${styles.hidden}`}>
                  Failed to add to cart
                </div>

                <button
                  className={`${styles.addToCartButton} ${enhancedProduct.stock <= 0 ? styles.disabled : ""}`}
                  disabled={true}
                  aria-label="Add to cart preview"
                >
                  {enhancedProduct.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
