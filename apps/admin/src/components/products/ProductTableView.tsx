import Link from "next/link";
import Image from "next/image";
import styles from "./ProductTableView.module.css";
import { DeleteProductButton } from "../../utils/DeleteProduct";
import { formatPrice, StatusBadge } from "@repo/utils";

type ProductTableViewProps = {
  products: any[];
  fetchProducts: () => void;
};

/**
 * ProductTableView component displays a list of products in a table format.
 * Each row includes product image, name, category, price, stock status,
 * and action buttons for viewing, editing, and deleting the product.
 *
 * @param {Object} props - Component properties
 * @param {any[]} props.products - Array of product objects to display
 * @param {Function} props.fetchProducts - Function to fetch products data
 * @returns {JSX.Element} The rendered product table component
 */
export function ProductTableView({
  products,
  fetchProducts,
}: ProductTableViewProps) {
  const isValidUrl = (url: string) => {
    try {
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        new URL(url);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className={styles.tableContainer} data-test-id="product-table">
      <table className={styles.productTable}>
        <thead>
          <tr>
            <th className={styles.imageColumn}>Image</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className={styles.productRow}
              data-test-id={"product-item"}
            >
              <td className={styles.imageCell}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={
                      isValidUrl(product.imageUrl)
                        ? product.imageUrl
                        : "/placeholder-image.jpg"
                    }
                    alt={product.name}
                    width={40}
                    height={40}
                    className={styles.productThumbnail}
                  />
                </div>
              </td>
              <td className={styles.nameCell}>
                <div className={`{styles.productName} product-name`}>
                  {product.name}
                </div>
                {product.brand && (
                  <div className={`${styles.productBrand} product-brand`}>
                    {product.brand}
                  </div>
                )}
              </td>
              <td className={`${styles.categoryCell} product-category`}>
                {product.category}
              </td>
              <td className={`${styles.priceCell} product-price`}>
                {formatPrice(product.price)}
              </td>
              <td className={`${styles.stockCell} stock-indicator`}>
                <StatusBadge stock={product.stock} />
              </td>
              <td className={`$styles.statusCell} product-status`}>
                <span
                  className={`${styles.statusBadge} ${product.active ? styles.activeStatus : styles.inactiveStatus}`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className={styles.actionsCell}>
                <div className={styles.actionButtons}>
                  <Link
                    href={`/products/${product.id}`}
                    className={`${styles.actionButton} ${styles.viewButton}`}
                    title="View product"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link
                    href={`/products/${product.id}/edit`}
                    className={`${styles.actionButton} ${styles.editButton}`}
                    title="Edit product"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Link>
                  <div className={styles.deleteButtonWrapper}>
                    <DeleteProductButton
                      productId={product.id}
                      variant="iconOnly"
                      buttonClassName={`${styles.actionButton} ${styles.deleteButton}`}
                      onSuccess={fetchProducts}
                      size="small"
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
