import styles from "./productForm.module.css";
import { ProductDetailPreview } from "./productPreview";

type DetailPreviewOverlayProps = {
  product: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category: string;
  };
  onClose: () => void;
};

export function DetailPreviewOverlay({
  product,
  onClose,
}: DetailPreviewOverlayProps) {
  return (
    <div className={styles.fullscreenPreview}>
      <div className={styles.fullscreenOverlay}>
        <div className={styles.previewFixedHeader}>
          <h3 className={styles.previewTitle}>Product Detail Preview</h3>
          <button
            type="button"
            className={styles.exitPreviewButton}
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="16"
              height="16"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
            Exit Preview
          </button>
        </div>

        <div className={styles.previewScrollContent}>
          <div className={styles.previewContent}>
            <ProductDetailPreview product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
