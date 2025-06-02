import Link from "next/link";
import styles from "./ProductListCard.module.css";
import { DeleteProductButton } from "../../utils/DeleteProduct";
import { formatPrice, StatusBadge, ProductImage } from "@repo/utils";

type ProductListCardProps = {
  products: any[];
  fetchProducts: () => void;
};

/**
 * ProductListCard component displays a list of products in card format.
 * Each card includes product image, name, category, price, stock status,
 * and action buttons for viewing, editing, and deleting the product.
 *
 * @param {Object} props - Component properties
 * @param {any[]} props.products - Array of product objects to display
 * @param {Function} props.fetchProducts - Function to fetch products data
 * @returns {JSX.Element} The rendered product list card component
 */
export function ProductListCard({
  products,
  fetchProducts,
}: ProductListCardProps) {
  return (
    <div className={styles.productList} data-test-id="product-cards">
      {products.map((product) => (
        <div
          key={product.id}
          className={styles.productCard}
          data-test-id="product-item"
        >
          <div className={styles.productImageContainer}>
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImage}
            />
            <span
              className={`${styles.statusFlag} ${product.active ? styles.activeFlag : styles.inactiveFlag}`}
            >
              {product.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{product.name}</h3>
            <div className={styles.productCategory}>{product.category}</div>
            <div className={styles.productPrice}>
              {formatPrice(product.price)}
            </div>

            <div className={styles.productMeta}>
              <div className={styles.stockInfo}>
                <span>Stock: {product.stock}</span>
              </div>
              <div>ID: {product.id.toString().slice(0, 8)}</div>
            </div>
            <div className={styles.productActions}>
              <Link
                href={`/products/${product.id}`}
                className={`${styles.actionButton} ${styles.viewButton}`}
              >
                <svg
                  className={styles.actionIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                View
              </Link>

              <Link
                href={`/products/${product.id}/edit`}
                className={`${styles.actionButton} ${styles.editButton}`}
              >
                <svg
                  className={styles.actionIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </Link>

              <div className={styles.actionButtonWrapper}>
                <DeleteProductButton
                  productId={product.id}
                  variant="icon"
                  buttonClassName={`${styles.actionButton} ${styles.deleteButton}`}
                  onSuccess={fetchProducts}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
