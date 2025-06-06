import styles from "./AdminProductCard.module.css";
import { formatPrice, ProductImage, StatusBadge } from "@repo/utils"; // Import the status badge functions
type AdminProductCardProps = {
  product: {
    id?: number;
    name: string;
    brand: string;
    description?: string;
    price: number;
    imageUrl: string;
    category: string;
    stock?: number;
  };
  isPreview?: boolean;
};

/**
 * Admin Product Card Component
 *
 * Renders a card displaying product information in the admin dashboard.
 * Shows key product details including name, brand, price, stock status,
 * and an image. Includes a button to add the product to the cart.
 *
 * @param {Object} props - Component properties
 * @param {Object} props.product - Product object containing product details
 * @param {boolean} [props.isPreview=false] - Flag to indicate if the card is in preview mode
 * @returns {JSX.Element} The rendered admin product card component
 */
export function AdminProductCard({
  product,
  isPreview = false,
}: AdminProductCardProps) {
  return (
    <div className={styles.adminCardWrapper}>
      <div className={styles.productCard}>
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
        </div>{" "}
        <StatusBadge stock={product.stock} className={styles.badgeCorner} />
        <div className={styles.productInfo}>
          <div className={styles.brandName}>{product.brand}</div>
          <h3 className={styles.productName}>{product.name}</h3>

          <div className={styles.productPrice}>
            {formatPrice(product.price)}
          </div>
        </div>
        <div className={styles.addToCartContainer}>
          <button
            className={`${styles.addToCartButton} `}
            aria-label="Add to cart"
          >
            Add to Cart
          </button>
        </div>{" "}
      </div>
    </div>
  );
}
