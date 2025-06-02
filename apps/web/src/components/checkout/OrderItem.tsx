import Image from "next/image";
import { formatPrice } from "@repo/utils";
import styles from "@/styles/checkout.module.css";

type OrderItemProps = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

/**
 * OrderItem component displays a single item in the order summary.
 * It includes the item's image, name, price, quantity, and total price.
 *
 * @param {OrderItemProps} props - The properties for the OrderItem component.
 * @returns {JSX.Element} The rendered order item component.
 */
export function OrderItem({
  id,
  name,
  price,
  quantity,
  image,
}: OrderItemProps) {
  return (
    <div className={styles.summaryItem}>
      <div className={styles.itemImageWrapper}>
        <Image
          src={image || "/placeholder.jpg"}
          alt={name}
          width={64}
          height={64}
          className={styles.itemImage}
        />
        <span className={styles.itemQuantity}>x{quantity}</span>
      </div>

      <div className={styles.itemDetails}>
        <span className={styles.itemName}>{name}</span>
        <span className={styles.itemPrice}>{formatPrice(price)}</span>
      </div>

      <span className={styles.itemTotal}>{formatPrice(price * quantity)}</span>
    </div>
  );
}
