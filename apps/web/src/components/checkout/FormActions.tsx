import Link from "next/link";
import styles from "@/styles/checkout.module.css";

type FormActionsProps = {
  isLoading: boolean;
};

export function FormActions({ isLoading }: FormActionsProps) {
  return (
    <div className={styles.actionButtons}>
      <Link href="/cart" className={styles.backButton}>
        Return to Cart
      </Link>
      <button
        type="submit"
        className={styles.placeOrderButton}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
}
