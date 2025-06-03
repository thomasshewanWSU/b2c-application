import Link from "next/link";
import styles from "@/styles/checkout.module.css";

type FormActionsProps = {
  isLoading: boolean;
};

/**
 * FormActions component renders action buttons for the checkout form.
 * It includes a button to return to the cart and a submit button to place the order.
 *
 * @param {FormActionsProps} props - The properties for the FormActions component.
 * @returns {JSX.Element} The rendered action buttons.
 */
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
