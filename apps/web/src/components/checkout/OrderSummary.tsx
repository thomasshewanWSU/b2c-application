import { formatPrice } from "@repo/utils";
import { OrderItem } from "./OrderItem";
import styles from "@/styles/checkout.module.css";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
};

type OrderSummaryProps = {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
};

export function OrderSummary({
  cartItems,
  subtotal,
  shippingCost,
  total,
}: OrderSummaryProps) {
  return (
    <div className={styles.orderSummary}>
      <h2 className={styles.summaryTitle}>Order Summary</h2>

      <div className={styles.summaryItems}>
        {cartItems.map((item) => (
          <OrderItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            quantity={item.quantity}
            image={item.image}
          />
        ))}
      </div>

      <div className={styles.summaryTotals}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
        </div>

        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
